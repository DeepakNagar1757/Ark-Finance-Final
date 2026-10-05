import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { req, sanitizeSearchTerm } from "@/lib/server/admin-crud";
import { writeAudit } from "@/lib/admin/auth";

export const LEAD_STATUSES = ["new", "contacted", "quoted", "converted", "closed"] as const;

const listSchema = z.object({
  search: z.string().trim().max(200).optional().default(""),
  status: z.string().trim().max(30).optional().default(""),
  service: z.string().trim().max(120).optional().default(""),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(200).optional().default(25),
});

export const adminListLeads = createServerFn({ method: "GET" })
  .validator((data: unknown) => listSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Bad query");
    await req();
    let query = supabaseAdmin
      .from("leads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });
    if (data.data.search) {
      const term = `%${sanitizeSearchTerm(data.data.search)}%`;
      query = query.or(
        `name.ilike.${term},email.ilike.${term},phone.ilike.${term},service.ilike.${term}`,
      );
    }
    if (data.data.status) query = query.eq("status", data.data.status);
    if (data.data.service) query = query.eq("service", data.data.service);

    const from = (data.data.page - 1) * data.data.pageSize;
    const to = from + data.data.pageSize - 1;
    const { data: rows, count, error } = await query.range(from, to);
    if (error) throw new Error(error.message);
    return {
      rows: rows ?? [],
      total: count ?? 0,
      page: data.data.page,
      pageSize: data.data.pageSize,
    };
  });

export const adminLeadsSummary = createServerFn({ method: "GET" }).handler(async () => {
  await req();
  const { data, error } = await supabaseAdmin.from("leads").select("status, created_at");
  if (error) throw new Error(error.message);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const newThisWeek = (data ?? []).filter((l) => l.created_at >= weekAgo).length;
  const byStatus: Record<string, number> = {};
  for (const l of data ?? []) byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
  return { total: data?.length ?? 0, newThisWeek, byStatus };
});

const updateSchema = z.object({
  id: z.string().uuid(),
  patch: z
    .object({
      status: z.enum(LEAD_STATUSES).optional(),
      internal_notes: z.string().trim().max(4000).optional(),
      assigned_to: z.string().uuid().nullable().optional(),
      name: z.string().trim().min(1).max(100).optional(),
      email: z.string().trim().email().max(255).optional(),
      phone: z.string().trim().min(8).max(20).optional(),
      service: z.string().trim().min(1).max(120).optional(),
    })
    .refine((p) => Object.keys(p).length > 0, "No fields to update"),
});

export const adminUpdateLead = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Bad request");
    const { user } = await req();
    const { error } = await supabaseAdmin
      .from("leads")
      .update(data.data.patch as never)
      .eq("id", data.data.id);
    if (error) throw new Error(error.message);
    await writeAudit(user, "update", "leads", data.data.id, data.data.patch);
    return { ok: true };
  });

export const adminDeleteLead = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { user } = await req();
    const { error } = await supabaseAdmin.from("leads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(user, "delete", "leads", data.id);
    return { ok: true };
  });

const exportSchema = z.object({
  search: z.string().trim().max(200).optional().default(""),
  status: z.string().trim().max(30).optional().default(""),
  service: z.string().trim().max(120).optional().default(""),
});

export const adminExportLeads = createServerFn({ method: "GET" })
  .validator((data: unknown) => exportSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Bad query");
    await req();
    let query = supabaseAdmin.from("leads").select("*").order("created_at", { ascending: false });
    if (data.data.search) {
      const term = `%${sanitizeSearchTerm(data.data.search)}%`;
      query = query.or(
        `name.ilike.${term},email.ilike.${term},phone.ilike.${term},service.ilike.${term}`,
      );
    }
    if (data.data.status) query = query.eq("status", data.data.status);
    if (data.data.service) query = query.eq("service", data.data.service);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    const esc = (v: string | null | undefined) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const header = "Name,Phone,Email,Service,Source Page,Status,Message,Internal Notes,Created At";
    const lines = (rows ?? []).map((r) =>
      [
        esc(r.name),
        esc(r.phone),
        esc(r.email),
        esc(r.service),
        esc(r.source_page),
        esc(r.status),
        esc(r.message),
        esc(r.internal_notes),
        esc(r.created_at),
      ].join(","),
    );
    return { csv: [header, ...lines].join("\n") };
  });
