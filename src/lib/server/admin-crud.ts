import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { AdminRole, AdminUser } from "@/lib/admin/auth";
import { ensureAdmin, writeAudit, ALLOWED_ROLES } from "@/lib/admin/auth";
import { bumpContentVersion } from "@/lib/server/content";

export async function req(
  roles: AdminRole[] = ["admin", "editor"],
): Promise<{ user: AdminUser; supabase: typeof supabaseAdmin }> {
  const user = await ensureAdmin(roles);
  return { user, supabase: supabaseAdmin };
}

/** Content tables whose saved state drives the public site. Mutations bump content version. */
const CONTENT_TABLES = new Set([
  "services",
  "testimonials",
  "team_members",
  "blog_posts",
  "page_sections",
  "stats",
  "process_steps",
  "site_settings",
  "seo_meta",
  "legal_pages",
  "media",
]);

async function afterWrite(
  user: AdminUser,
  entity: string,
  entityId: string | null,
  action: string,
  meta: Record<string, unknown> = {},
) {
  if (CONTENT_TABLES.has(entity)) {
    await bumpContentVersion().catch((err) => console.error("bump failed", err));
  }
  await writeAudit(user, action, entity, entityId, meta);
}

export async function listRows(
  table: string,
  orderCol: string,
  ascending = true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const { data, error } = await supabaseAdmin
    .from(table as never)
    .select("*")
    .order(orderCol, { ascending });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createRow(
  table: string,
  row: Record<string, unknown>,
): Promise<{ id: string | null }> {
  const { user } = await req();
  const { data, error } = (await supabaseAdmin
    .from(table as never)
    .insert(row as never)
    .select("id")
    .single()) as unknown as { data: { id: string } | null; error: { message: string } | null };
  if (error) throw new Error(error.message);
  const id = (data?.id as string) ?? null;
  await afterWrite(user, table, id, "create", row);
  return { id };
}

export async function updateRow(table: string, id: string, row: Record<string, unknown>) {
  const { user } = await req();
  const { error } = await supabaseAdmin
    .from(table as never)
    .update(row as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
  await afterWrite(user, table, id, "update", row);
}

export async function deleteRow(table: string, id: string) {
  const { user } = await req();
  const { error } = await supabaseAdmin
    .from(table as never)
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  await afterWrite(user, table, id, "delete");
}

export async function toggleField(table: string, id: string, field: string, value: unknown) {
  await updateRow(table, id, { [field]: value });
}

/** Reorders rows by setting sort_order to each id's index (0-based). */
export async function reorderRows(table: string, ids: string[], ascending = true) {
  const { user } = await req();
  const updates = ids.map((id, index) => ({
    id,
    sort_order: ascending ? index : ids.length - 1 - index,
  }));
  const { error } = await supabaseAdmin.from(table as never).upsert(updates as never);
  if (error) throw new Error(error.message);
  await afterWrite(user, table, null, "reorder", { ids });
}

export const ROLE_OPTIONS: AdminRole[] = [...ALLOWED_ROLES];

/** Strips PostgREST ilike/or filter metacharacters from user search input. */
export function sanitizeSearchTerm(term: string): string {
  return term
    .replace(/[%_,()\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
