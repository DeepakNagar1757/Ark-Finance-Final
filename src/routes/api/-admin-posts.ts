import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { req, sanitizeSearchTerm } from "@/lib/server/admin-crud";
import { writeAudit } from "@/lib/admin/auth";
import { slugify } from "@/lib/queries";
import { bumpContentVersion } from "@/lib/server/content";

const postSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(200).optional().default(""),
  excerpt: z.string().trim().max(500).optional().default(""),
  content: z.string().max(200000).optional().default(""),
  cover_url: z.string().trim().max(800).nullable().optional(),
  og_image: z.string().trim().max(800).nullable().optional(),
  category: z.string().trim().max(80).optional().default("Finance"),
  tags: z.array(z.string().trim().max(60)).max(20).optional().default([]),
  author: z.string().trim().max(120).optional().default("ARK Finance Consultancy"),
  published_at: z.string().optional(),
  status: z.enum(["draft", "scheduled", "published"]).default("published"),
  seo_title: z.string().trim().max(200).optional().default(""),
  seo_description: z.string().trim().max(320).optional().default(""),
});

export const adminListPosts = createServerFn({ method: "GET" })
  .validator((data: { search?: string; page?: number; pageSize?: number }) => data)
  .handler(async ({ data }) => {
    await req();
    const search = (data.search ?? "").trim();
    const page = data.page ?? 1;
    const pageSize = Math.min(data.pageSize ?? 25, 100);
    let query = supabaseAdmin
      .from("blog_posts")
      .select("*", { count: "exact" })
      .order("published_at", { ascending: false });
    if (search) {
      const term = `%${sanitizeSearchTerm(search)}%`;
      query = query.or(`title.ilike.${term},slug.ilike.${term},category.ilike.${term}`);
    }
    const from = (page - 1) * pageSize;
    const { data: rows, count, error } = await query.range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], total: count ?? 0, page, pageSize };
  });

export const adminGetPost = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await req();
    const { data: row, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminSavePost = createServerFn({ method: "POST" })
  .validator((data: unknown) => postSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) throw new Error("Invalid data");
    const d = data.data;
    const slug = (d.slug || slugify(d.title)).toLowerCase();
    const published = d.status === "published";
    const publishedAt = d.published_at ?? (published ? new Date().toISOString() : undefined);

    const payload = {
      title: d.title,
      slug,
      excerpt: d.excerpt,
      content: d.content,
      cover_url: d.cover_url ?? null,
      og_image: d.og_image ?? null,
      category: d.category,
      tags: d.tags,
      author: d.author,
      status: d.status,
      is_published: published,
      published_at: publishedAt,
      seo_title: d.seo_title,
      seo_description: d.seo_description,
    };

    const { user, supabase } = await req();
    let id = d.id ?? null;
    if (id) {
      const { error } = await supabase
        .from("blog_posts")
        .update(payload as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { data: created, error } = await supabase
        .from("blog_posts")
        .insert(payload as never)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      id = created?.id ?? null;
    }
    await bumpContentVersion();
    await writeAudit(user, "save", "blog_posts", id, { title: d.title, status: d.status });
    return { id };
  });

export const adminDeletePost = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { user, supabase } = await req();
    const { error } = await supabase.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await bumpContentVersion();
    await writeAudit(user, "delete", "blog_posts", data.id);
    return { ok: true };
  });
