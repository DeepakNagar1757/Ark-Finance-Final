import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { req, sanitizeSearchTerm } from "@/lib/server/admin-crud";
import { writeAudit, hashPassword, verifyPassword, ensureAdmin } from "@/lib/admin/auth";

export const adminDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const user = await ensureAdmin();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [leads, subs, posts, services] = await Promise.all([
    supabaseAdmin
      .from("leads")
      .select("id, status, created_at, name, service")
      .order("created_at", { ascending: false })
      .limit(200),
    supabaseAdmin.from("newsletter_subscribers").select("id, created_at"),
    supabaseAdmin.from("blog_posts").select("id, status"),
    supabaseAdmin.from("services").select("id"),
  ]);

  const rows = (leads.data ?? []) as {
    id: string;
    status: string;
    created_at: string;
    name: string;
    service: string;
  }[];
  const newThisWeek = rows.filter((l) => l.created_at >= weekAgo).length;
  const byStatus: Record<string, number> = {};
  for (const l of rows) byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;

  const postsList = (posts.data ?? []) as { status: string }[];
  const servicesCount = (services.data ?? []).length;

  return {
    user,
    newLeadsThisWeek: newThisWeek,
    totalLeads: rows.length,
    leadsByStatus: byStatus,
    recentLeads: rows.slice(0, 5),
    subscribers: (subs.data ?? []).length,
    publishedPosts: postsList.filter((p) => p.status === "published").length,
    draftPosts: postsList.filter((p) => p.status === "draft" || p.status === "scheduled").length,
    servicesCount,
  };
});

export const adminListSubscribers = createServerFn({ method: "GET" })
  .validator((data: { page?: number; pageSize?: number; search?: string; status?: string }) => data)
  .handler(async ({ data }) => {
    await req();
    const page = data.page ?? 1;
    const pageSize = Math.min(data.pageSize ?? 50, 200);
    const search = (data.search ?? "").trim();
    const status = (data.status ?? "").trim();
    let query = supabaseAdmin
      .from("newsletter_subscribers")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });
    if (search) {
      const term = `%${sanitizeSearchTerm(search)}%`;
      query = query.or(`email.ilike.${term},source.ilike.${term}`);
    }
    if (status) query = query.eq("status", status);
    const from = (page - 1) * pageSize;
    const { data: rows, count, error } = await query.range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], total: count ?? 0, page, pageSize };
  });

const subscriberUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["active", "unsubscribed"]),
});

export const adminUpdateSubscriber = createServerFn({ method: "POST" })
  .validator((data: unknown) => subscriberUpdateSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    const { user } = await req();
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ status: data.data.status })
      .eq("id", data.data.id);
    if (error) throw new Error(error.message);
    await writeAudit(user, "update", "newsletter_subscribers", data.data.id, {
      status: data.data.status,
    });
    return { ok: true };
  });

const subscriberDeleteSchema = z.object({ id: z.string().uuid() });

export const adminDeleteSubscriber = createServerFn({ method: "POST" })
  .validator((data: unknown) => subscriberDeleteSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    const { user } = await req();
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .delete()
      .eq("id", data.data.id);
    if (error) throw new Error(error.message);
    await writeAudit(user, "delete", "newsletter_subscribers", data.data.id);
    return { ok: true };
  });

const userSchema = z.object({
  email: z.string().trim().email().max(255),
  name: z.string().trim().max(120).optional().default(""),
  role: z.enum(["admin", "editor"]),
  password: z.string().min(8).max(200),
});

export const adminCreateUser = createServerFn({ method: "POST" })
  .validator((data: unknown) => userSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    await ensureAdmin(["admin"]);
    const { user } = await req(["admin"]);
    const password_hash = await hashPassword(data.data.password);
    const { data: created, error } = await supabaseAdmin
      .from("admin_users")
      .insert({
        email: data.data.email.toLowerCase(),
        name: data.data.name,
        role: data.data.role,
        password_hash,
      })
      .select("id, email, name, role")
      .single();
    if (error) {
      throw new Response(JSON.stringify({ message: error.message }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    await writeAudit(user, "create", "admin_users", created.id, {
      email: created.email,
      role: created.role,
    });
    return created;
  });

const userStatusSchema = z.object({
  id: z.string().uuid(),
  is_active: z.boolean(),
});

export const adminToggleUser = createServerFn({ method: "POST" })
  .validator((data: unknown) => userStatusSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    const { user } = await req(["admin"]);
    if (data.data.id === user.id && !data.data.is_active) {
      throw new Response(JSON.stringify({ message: "You cannot deactivate your own account" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const { error } = await supabaseAdmin
      .from("admin_users")
      .update({ is_active: data.data.is_active })
      .eq("id", data.data.id);
    if (error) throw new Error(error.message);
    await writeAudit(user, "update", "admin_users", data.data.id, {
      is_active: data.data.is_active,
    });
    return { ok: true };
  });

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(200),
  newPassword: z.string().min(8).max(200),
});

export const adminChangePassword = createServerFn({ method: "POST" })
  .validator((data: unknown) => changePasswordSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    const user = await ensureAdmin();
    const { data: row } = await supabaseAdmin
      .from("admin_users")
      .select("id, password_hash")
      .eq("id", user.id)
      .single();
    if (!row || !(await verifyPassword(data.data.currentPassword, row.password_hash))) {
      throw new Response(JSON.stringify({ message: "Current password is incorrect" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    if (data.data.newPassword === data.data.currentPassword) {
      throw new Response(JSON.stringify({ message: "New password must be different" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const password_hash = await hashPassword(data.data.newPassword);
    const { error } = await supabaseAdmin
      .from("admin_users")
      .update({ password_hash })
      .eq("id", user.id);
    if (error) throw new Error(error.message);
    await writeAudit(user, "update", "admin_users", user.id, { action: "change_password" });
    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { user } = await req(["admin"]);
    if (data.id === user.id) {
      throw new Response(JSON.stringify({ message: "You cannot delete your own account" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const { error } = await supabaseAdmin.from("admin_users").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(user, "delete", "admin_users", data.id);
    return { ok: true };
  });

export const adminListUsers = createServerFn({ method: "GET" }).handler(async () => {
  await ensureAdmin(["admin"]);
  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("id, email, name, role, is_active, created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminListAudit = createServerFn({ method: "GET" })
  .validator((data: { limit?: number }) => data)
  .handler(async ({ data }) => {
    await ensureAdmin(["admin"]);
    const limit = Math.min(data.limit ?? 100, 500);
    const { data: rows, error } = await supabaseAdmin
      .from("audit_log")
      .select("*, admin_users(email, name)")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
