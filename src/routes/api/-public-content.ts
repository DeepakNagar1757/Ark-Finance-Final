import { createServerFn } from "@tanstack/react-start";
import {
  getLegalPage,
  getPostBySlug,
  getPublishedPosts,
  getPublicSiteData,
  getSeoMeta,
  serviceOptions,
} from "@/lib/server/content";

export const publicSiteData = createServerFn({ method: "GET" }).handler(async () =>
  getPublicSiteData(),
);

export const publicPosts = createServerFn({ method: "GET" }).handler(async () =>
  getPublishedPosts(),
);

export const publicPost = createServerFn({ method: "GET" })
  .validator((data: { slug: string; preview?: boolean }) => data)
  .handler(async ({ data }) => getPostBySlug(data.slug, data.preview ?? false));

export const publicLegal = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => getLegalPage(data.slug));

export const publicSeo = createServerFn({ method: "GET" })
  .validator((data: { route: string }) => data)
  .handler(async ({ data }) => getSeoMeta(data.route));

export const publicServiceOptions = createServerFn({ method: "GET" }).handler(async () =>
  serviceOptions(),
);