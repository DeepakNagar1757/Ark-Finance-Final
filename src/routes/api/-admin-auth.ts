import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import {
  checkLoginRateLimit,
  createSession,
  destroySession,
  getSessionUser,
  hashPassword,
  recordLoginAttempt,
  verifyPassword,
  writeAudit,
  type AdminRole,
} from "@/lib/admin/auth";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(200),
});

function clientIp(): string {
  const request = getRequest();
  const fwd = request?.headers?.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0]?.trim() || request?.headers?.get("x-real-ip") || "unknown";
}

function safeUser(user: { id: string; email: string; name: string; role: string }) {
  return { id: user.id, email: user.email, name: user.name, role: user.role as AdminRole };
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // Still perform a comparison to reduce timing signal on length mismatch.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

export const adminLogin = createServerFn({ method: "POST" })
  .validator((data: unknown) => loginSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) {
      throw new Response(JSON.stringify({ message: "Invalid email or password" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const ip = clientIp();
    const limit = checkLoginRateLimit(ip);
    if (!limit.allowed) {
      throw new Response(
        JSON.stringify({ message: `Too many attempts. Try again in ${limit.retryAfterSec}s.` }),
        { status: 429, headers: { "content-type": "application/json" } },
      );
    }

    const { data: user } = await supabaseAdmin
      .from("admin_users")
      .select("id, email, name, role, password_hash, is_active")
      .eq("email", data.data.email.toLowerCase())
      .maybeSingle();

    if (
      !user ||
      !user.is_active ||
      !(await verifyPassword(data.data.password, user.password_hash))
    ) {
      recordLoginAttempt(ip, false);
      throw new Response(JSON.stringify({ message: "Invalid email or password" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    recordLoginAttempt(ip, true);
    await createSession(user.id);
    await writeAudit(user, "login", "admin_users", user.id, { ip });
    return safeUser(user);
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const user = await getSessionUser();
  await destroySession();
  if (user) {
    await writeAudit(user, "logout", "admin_users", user.id);
  }
  return { ok: true };
});

export const adminMe = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getSessionUser();
  return user ? safeUser(user) : null;
});

const bootstrapSchema = z.object({ setupToken: z.string().min(1) });

export const adminBootstrap = createServerFn({ method: "POST" })
  .validator((data: unknown) => bootstrapSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) {
      throw new Response(JSON.stringify({ message: "Missing setup token" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const expected = process.env["ADMIN_SETUP_TOKEN"];
    if (!expected || !timingSafeStringEqual(data.data.setupToken, expected)) {
      throw new Response(JSON.stringify({ message: "Invalid setup token" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      });
    }
    const email = (process.env["ADMIN_EMAIL"] ?? "").trim().toLowerCase();
    const password = process.env["ADMIN_PASSWORD"] ?? "";
    if (!email || password.length < 8) {
      throw new Response(
        JSON.stringify({
          message: "ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars) must be set on the server.",
        }),
        { status: 500, headers: { "content-type": "application/json" } },
      );
    }
    const { count } = await supabaseAdmin
      .from("admin_users")
      .select("id", { count: "exact", head: true });
    if ((count ?? 0) > 0) {
      throw new Response(JSON.stringify({ message: "An admin already exists" }), {
        status: 409,
        headers: { "content-type": "application/json" },
      });
    }
    const password_hash = await hashPassword(password);
    const { data: created, error } = await supabaseAdmin
      .from("admin_users")
      .insert({ email, name: "Administrator", role: "admin", password_hash })
      .select("id, email, name, role")
      .single();
    if (error) throw new Error(error.message);
    await createSession(created.id);
    return safeUser(created);
  });
