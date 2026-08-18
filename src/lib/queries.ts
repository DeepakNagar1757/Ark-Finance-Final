import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];
export type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type SiteImage = Database["public"]["Tables"]["site_images"]["Row"];

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async () =>
    unwrap(await supabase.from("services").select("*").order("sort_order", { ascending: true })),
});

export const testimonialsQuery = queryOptions({
  queryKey: ["testimonials"],
  queryFn: async () =>
    unwrap(
      await supabase.from("testimonials").select("*").order("sort_order", { ascending: true }),
    ),
});

const ARUN_JOSHI: TeamMember = {
  id: "arun-joshi-fallback",
  name: "Arun Joshi",
  designation: "Head Consultant",
  bio: "Arun oversees client operations and ensures every file meets ARK's quality standards before it leaves the office. With a strong background in lending and client servicing, he works closely with borrowers to structure files that clear underwriting on the first submission. His attention to detail and hands-on approach have made him a trusted point of contact for clients across Ahmedabad and Gujarat.",
  photo_url: "/arun-joshi.jpeg",
  sort_order: 2,
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const teamQuery = queryOptions({
  queryKey: ["team_members"],
  queryFn: async () => {
    const data = unwrap(
      await supabase.from("team_members").select("*").order("sort_order", { ascending: true }),
    ).map((m) => ({
      ...m,
      designation: m.designation.replace(/Inter CA/gi, "CAFC Qualified"),
      bio: m.bio.replace(/Inter CA/gi, "CAFC Qualified"),
    }));
    const hasArun = data.some((m) => m.name === "Arun Joshi");
    return hasArun ? data : [...data, ARUN_JOSHI];
  },
});

export const postsQuery = queryOptions({
  queryKey: ["blog_posts"],
  queryFn: async () =>
    unwrap(
      await supabase.from("blog_posts").select("*").order("published_at", { ascending: false }),
    ),
});

export const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog_posts", slug],
    queryFn: async (): Promise<BlogPost | null> => {
      const res = await supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
  });

export const leadsQuery = queryOptions({
  queryKey: ["leads"],
  queryFn: async () =>
    unwrap(await supabase.from("leads").select("*").order("created_at", { ascending: false })),
});

export const siteImagesQuery = queryOptions({
  queryKey: ["site_images"],
  queryFn: async () =>
    unwrap(await supabase.from("site_images").select("*").order("key", { ascending: true })),
});

export const subscribersQuery = queryOptions({
  queryKey: ["newsletter_subscribers"],
  queryFn: async () =>
    unwrap(
      await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false }),
    ),
});

/** Uploads a file to the site-media bucket and returns a long-lived readable URL. */
export async function uploadMedia(folder: string, file: File) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("site-media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const signed = await supabase.storage
    .from("site-media")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (signed.error) throw new Error(signed.error.message);
  return signed.data.signedUrl;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
