import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { LeadForm } from "@/components/site/LeadForm";
import { postQuery } from "@/lib/queries";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params, context }) => {
    const post = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Article unavailable | ARK Finance Consultancy" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} | ARK Finance Consultancy` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: PostNotFound,
  errorComponent: PostNotFound,
  component: PostPage,
});

function PostNotFound() {
  return (
    <SiteLayout>
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-semibold text-primary">Article not available</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This article may have been moved or unpublished.
        </p>
        <Link to="/blog" className="mt-6 inline-flex text-sm font-semibold text-primary underline">
          Back to all insights
        </Link>
      </div>
    </SiteLayout>
  );
}

function PostPage() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(postQuery(slug));
  if (!post) return <PostNotFound />;

  const blocks = post.content.split("\n").filter((line) => line.trim().length > 0);

  return (
    <SiteLayout>
      <article>
        <header className="border-b border-border bg-primary py-16 text-primary-foreground sm:py-20">
          <div className="container-page">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent"
            >
              <ArrowLeft className="size-4" aria-hidden />
              All insights
            </Link>
            <h1 className="mt-6 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-5 flex items-center gap-2 text-sm text-primary-foreground/70">
              <CalendarDays className="size-4 text-accent" aria-hidden />
              {new Date(post.published_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              <span aria-hidden>·</span>
              {post.author}
            </p>
          </div>
        </header>

        {post.cover_url && (
          <div className="container-page -mt-10">
            <img
              src={post.cover_url}
              alt={post.title}
              className="w-full rounded-lg object-cover shadow-elevated"
            />
          </div>
        )}

        <div className="container-page grid gap-14 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div className="max-w-2xl">
            <p className="text-lg leading-relaxed text-foreground">{post.excerpt}</p>
            <div className="mt-8 space-y-5">
              {blocks.map((block, index) =>
                block.startsWith("## ") ? (
                  <h2 key={index} className="pt-4 text-xl font-semibold text-primary">
                    {block.replace("## ", "")}
                  </h2>
                ) : (
                  <p key={index} className="text-base leading-relaxed text-muted-foreground">
                    {block}
                  </p>
                ),
              )}
            </div>
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <LeadForm />
          </aside>
        </div>
      </article>
    </SiteLayout>
  );
}
