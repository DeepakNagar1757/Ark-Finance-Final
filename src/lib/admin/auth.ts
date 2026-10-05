import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { getCookie, getRequest, setCookie } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";

type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"];
export type { AdminUser };

const SESSION_COOKIE = "ark_admin_session";
const SESSION_TTL_DAYS = 30;

export const ALLOWED_ROLES = ["admin", "editor"] as const;
export type AdminRole = (typeof ALLOWED_ROLES)[number];

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function newSessionToken(): string {
  return createHash("sha256")
    .update(crypto.randomUUID() + crypto.randomUUID())
    .digest("hex");
}

const sessionCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env["NODE_ENV"] === "production",
  path: "/",
  maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
});

export async function createSession(userId: string): Promise<void> {
  const token = newSessionToken();
  const { error } = await supabaseAdmin.from("admin_sessions").insert({
    user_id: userId,
    token_hash: sha256(token),
    expires_at: new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
  });
  if (error) throw new Error(`Failed to create session: ${error.message}`);
  setCookie(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function destroySession(): Promise<void> {
  const request = getRequest();
  const token = request?.headers?.get("cookie") ? getCookie(SESSION_COOKIE) : undefined;
  if (token) {
    await supabaseAdmin.from("admin_sessions").delete().eq("token_hash", sha256(token));
  }
  setCookie(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
}

export async function getSessionUser(): Promise<AdminUser | null> {
  const request = getRequest();
  if (!request?.headers) return null;
  const token = getCookie(SESSION_COOKIE);
  if (!token) return null;

  const { data: session } = await supabaseAdmin
    .from("admin_sessions")
    .select("user_id, expires_at, token_hash, last_used_at")
    .eq("token_hash", sha256(token))
    .maybeSingle();

  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;

  const { data: user } = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .eq("id", session.user_id)
    .maybeSingle();
  if (!user || !user.is_active) return null;

  // Sliding expiry: extend only when less than half the TTL remains.
  const now = Date.now();
  const ttlMs = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
  const halfTtlMs = ttlMs / 2;
  const remainingMs = new Date(session.expires_at).getTime() - now;
  const lastUsed = session.last_used_at ? new Date(session.last_used_at).getTime() : 0;
  const shouldTouchLastUsed = now - lastUsed > 60 * 60 * 1000;

  if (remainingMs < halfTtlMs) {
    await supabaseAdmin
      .from("admin_sessions")
      .update({
        expires_at: new Date(now + ttlMs).toISOString(),
        last_used_at: new Date(now).toISOString(),
      })
      .eq("token_hash", sha256(token));
  } else if (shouldTouchLastUsed) {
    await supabaseAdmin
      .from("admin_sessions")
      .update({ last_used_at: new Date(now).toISOString() })
      .eq("token_hash", sha256(token));
  }

  return user;
}

/** Throws a 401/403 Response when the request is not authenticated / lacks the role. */
export async function ensureAdmin(roles: AdminRole[] = ["admin", "editor"]): Promise<AdminUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  if (!ALLOWED_ROLES.includes(user.role as AdminRole) || !roles.includes(user.role as AdminRole)) {
    throw new Response(JSON.stringify({ message: "Forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  return user;
}

// ------------------------------------------------------------
// Login rate limiting (best-effort, per serverless instance)
// ------------------------------------------------------------
const attempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function checkLoginRateLimit(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = attempts.get(key);
  if (entry && entry.lockedUntil > now) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  return { allowed: true, retryAfterSec: 0 };
}

export function recordLoginAttempt(key: string, success: boolean): number {
  const now = Date.now();
  if (success) {
    attempts.delete(key);
    return 0;
  }
  const entry = attempts.get(key);
  if (!entry || now > entry.lockedUntil + WINDOW_MS) {
    attempts.set(key, { count: 1, lockedUntil: now + WINDOW_MS });
    return MAX_ATTEMPTS - 1;
  }
  const count = entry.count + 1;
  if (count >= MAX_ATTEMPTS) {
    attempts.set(key, { count, lockedUntil: now + WINDOW_MS });
  } else {
    attempts.set(key, { count, lockedUntil: entry.lockedUntil });
  }
  return Math.max(0, MAX_ATTEMPTS - count);
}

export async function writeAudit(
  user: AdminUser,
  action: string,
  entity: string,
  entityId?: string | null,
  meta: Record<string, unknown> = {},
): Promise<void> {
  try {
    await supabaseAdmin.from("audit_log").insert({
      user_id: user.id,
      user_role: user.role,
      action,
      entity,
      entity_id: entityId ?? null,
      meta: meta as never,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
