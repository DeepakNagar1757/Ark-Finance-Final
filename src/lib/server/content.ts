import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";

type Settings = Database["public"]["Tables"]["site_settings"]["Row"];
type PageSection = Database["public"]["Tables"]["page_sections"]["Row"];
type Stat = Database["public"]["Tables"]["stats"]["Row"];
type ProcessStep = Database["public"]["Tables"]["process_steps"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];
type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];
type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
type Post = Database["public"]["Tables"]["blog_posts"]["Row"];
type LegalPage = Database["public"]["Tables"]["legal_pages"]["Row"];

// In-memory cache invalidated whenever site_settings.content_version changes.
// content_version is bumped by every admin write (see bumpContentVersion).
const cache = new Map<string, { version: number; value: unknown }>();

async function currentVersion(): Promise<number> {
  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("content_version")
    .eq("id", true)
    .maybeSingle();
  return data?.content_version ?? 0;
}

export async function cached<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  const version = await currentVersion();
  const hit = cache.get(key);
  if (hit && hit.version === version) return hit.value as T;
  const value = await fetchFn();
  cache.set(key, { version, value });
  return value;
}

/** Bump the global content version and drop the cache. Called after every admin write. */
export async function bumpContentVersion(): Promise<void> {
  const { data: settings } = await supabaseAdmin
    .from("site_settings")
    .select("content_version")
    .eq("id", true)
    .maybeSingle();
  const next = (settings?.content_version ?? 0) + 1;
  const { error } = await supabaseAdmin
    .from("site_settings")
    .update({ content_version: next })
    .eq("id", true);
  if (error) throw new Error(`Failed to bump content version: ${error.message}`);
  cache.clear();
}

export interface PublicSiteData {
  settings: Settings | null;
  sections: PageSection[];
  stats: Stat[];
  process: ProcessStep[];
  services: Service[];
  team: TeamMember[];
  testimonials: Testimonial[];
}

export async function getPublicSiteData(): Promise<PublicSiteData> {
  const load = async (): Promise<PublicSiteData> => {
    const [settings, sections, stats, process, services, team, testimonials] = await Promise.all([
      supabaseAdmin.from("site_settings").select("*").eq("id", true).maybeSingle(),
      supabaseAdmin
        .from("page_sections")
        .select("*")
        .eq("is_active", true)
        .order("page", { ascending: true })
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("stats")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("process_steps")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("services")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("team_members")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("testimonials")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
    ]);

    return {
      settings: settings.data,
      sections: sections.data ?? [],
      stats: stats.data ?? [],
      process: process.data ?? [],
      services: services.data ?? [],
      team: team.data ?? [],
      testimonials: testimonials.data ?? [],
    };
  };

  return cached("site", load);
}

export async function getPublishedPosts(): Promise<Post[]> {
  return cached("posts", async () => {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .eq("is_published", true)
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
}

export async function getPostBySlug(slug: string, preview = false): Promise<Post | null> {
  const { data, error } = await supabaseAdmin
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  // Draft/scheduled posts are only visible in preview mode.
  if (!preview && (data.status !== "published" || !data.is_published)) return null;
  return data;
}

export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  return cached(`legal:${slug}`, async () => {
    const { data, error } = await supabaseAdmin
      .from("legal_pages")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });
}

export async function getSeoMeta(route: string): Promise<Database["public"]["Tables"]["seo_meta"]["Row"] | null> {
  return cached(`seo:${route}`, async () => {
    const { data, error } = await supabaseAdmin
      .from("seo_meta")
      .select("*")
      .eq("route", route)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });
}

export async function serviceOptions(): Promise<{ title: string }[]> {
  const { data, error } = await supabaseAdmin
    .from("services")
    .select("title")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}