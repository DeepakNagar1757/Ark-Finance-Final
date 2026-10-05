import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { req } from "@/lib/server/admin-crud";
import { writeAudit } from "@/lib/admin/auth";
import { bumpContentVersion } from "@/lib/server/content";
import type { Database } from "@/integrations/supabase/types";

const sectionSchema = z.object({
  id: z.string().min(1).optional(),
  page: z.string().trim().min(1).max(60),
  section_key: z.string().trim().min(1).max(120),
  eyebrow: z.string().trim().max(300).optional().default(""),
  heading: z.string().trim().max(300).optional().default(""),
  intro: z.string().trim().max(2000).optional().default(""),
  body: z.string().trim().max(20000).optional().default(""),
  cta_label: z.string().trim().max(200).optional().default(""),
  cta_target: z.string().trim().max(300).optional().default(""),
  media_url: z.string().trim().max(800).nullable().optional(),
  align: z.enum(["left", "center"]).optional().default("left"),
  sort_order: z.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
});

export const adminListSections = createServerFn({ method: "GET" })
  .validator((data: { page?: string }) => data)
  .handler(async ({ data }) => {
    await req();
    let query = supabaseAdmin
      .from("page_sections")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data.page) query = query.eq("page", data.page);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSaveSection = createServerFn({ method: "POST" })
  .validator((data: unknown) => sectionSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    const { user, supabase } = await req();
    const row = data.data;
    let id = row.id ?? null;
    if (id) {
      const { id: _i, ...rest } = row;
      const { error } = await supabase
        .from("page_sections")
        .update(rest as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { data: created, error } = await supabase
        .from("page_sections")
        .insert(row as never)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      id = created?.id ?? null;
    }
    await bumpContentVersion();
    await writeAudit(user, "save", "page_sections", id, {
      page: row.page,
      section_key: row.section_key,
    });
    return { id };
  });

export const adminDeleteSection = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { user, supabase } = await req();
    const { error } = await supabase.from("page_sections").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await bumpContentVersion();
    await writeAudit(user, "delete", "page_sections", data.id);
    return { ok: true };
  });

const settingsSchema = z.object({
  firm_name: z.string().trim().min(1).max(120),
  short_name: z.string().trim().max(80),
  tagline: z.string().trim().max(200),
  logo_url: z.string().trim().max(600).nullable().optional(),
  phone: z.string().trim().max(40),
  phone_href: z.string().trim().max(80),
  whatsapp_number: z.string().trim().max(40),
  whatsapp_message: z.string().trim().max(300),
  public_email: z.string().trim().email().max(255),
  address_line1: z.string().trim().max(200),
  address_line2: z.string().trim().max(200),
  address_area: z.string().trim().max(200),
  address_region: z.string().trim().max(200),
  maps_link: z.string().trim().max(800),
  office_hours: z.string().trim().max(200),
  established_year: z.number().int().min(1900).max(2100).nullable().optional(),
  footer_blurb: z.string().trim().max(2000),
  footer_copyright: z.string().trim().max(200),
  founder_name: z.string().trim().max(120),
  founder_title: z.string().trim().max(200),
  social_links: z.record(z.string().max(500)).optional(),
});

export const adminGetSettings = createServerFn({ method: "GET" }).handler(async () => {
  await req();
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});

export const adminSaveSettings = createServerFn({ method: "POST" })
  .validator((data: unknown) => settingsSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    const { user, supabase } = await req();
    const { error } = await supabaseAdmin
      .from("site_settings")
      .update(data.data as never)
      .eq("id", true);
    if (error) throw new Error("Failed to save settings");
    await bumpContentVersion();
    await writeAudit(user, "save", "site_settings", "true", { firm_name: data.data.firm_name });
    return { ok: true };
  });

const seoSchema = z.object({
  id: z.string().min(1).optional(),
  route: z.string().trim().min(1).max(120),
  title: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(400).optional().default(""),
  og_image: z.string().trim().max(800).nullable().optional(),
  robots: z.string().trim().max(120).optional().default("index, follow"),
});

export const adminListSeo = createServerFn({ method: "GET" }).handler(async () => {
  await req();
  const { data, error } = await supabaseAdmin.from("seo_meta").select("*").order("route");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminSaveSeo = createServerFn({ method: "POST" })
  .validator((data: unknown) => seoSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    const { user, supabase } = await req();
    const row = data.data;
    if (row.id) {
      const { id, ...rest } = row;
      const { error } = await supabase
        .from("seo_meta")
        .update(rest as never)
        .eq("id", id);
      if (error) throw new Error("Failed to save SEO");
    } else {
      const { error } = await supabase.from("seo_meta").insert(row as never);
      if (error) throw new Error("Failed to save SEO");
    }
    await bumpContentVersion();
    await writeAudit(user, "save", "seo_meta", row.id ?? null, { route: row.route });
    return { ok: true };
  });

export const adminDeleteSeo = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { user, supabase } = await req();
    const { error } = await supabase.from("seo_meta").delete().eq("id", data.id);
    if (error) throw new Error("Failed to delete SEO entry");
    await bumpContentVersion();
    await writeAudit(user, "delete", "seo_meta", data.id);
    return { ok: true };
  });

const legalSchema = z.object({
  id: z.string().min(1).optional(),
  slug: z.string().trim().min(1).max(60),
  title: z.string().trim().min(1).max(200),
  intro: z.string().trim().max(500),
  body: z.string().max(200000),
});

export const adminListLegal = createServerFn({ method: "GET" }).handler(async () => {
  await req();
  const { data, error } = await supabaseAdmin.from("legal_pages").select("*").order("slug");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminSaveLegal = createServerFn({ method: "POST" })
  .validator((data: unknown) => legalSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    const { user, supabase } = await req();
    const row = data.data;
    if (row.id) {
      const { id, ...rest } = row;
      const { error } = await supabase
        .from("legal_pages")
        .update(rest as never)
        .eq("id", id);
      if (error) throw new Error("Failed to save page");
    } else {
      const { error } = await supabase.from("legal_pages").insert(row as never);
      if (error) throw new Error("Failed to save page");
    }
    await bumpContentVersion();
    await writeAudit(user, "save", "legal_pages", row.id ?? null, { slug: row.slug });
    return { ok: true };
  });

export const adminDeleteLegal = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { user, supabase } = await req();
    const { error } = await supabase.from("legal_pages").delete().eq("id", data.id);
    if (error) throw new Error("Failed to delete page");
    await bumpContentVersion();
    await writeAudit(user, "delete", "legal_pages", data.id);
    return { ok: true };
  });
