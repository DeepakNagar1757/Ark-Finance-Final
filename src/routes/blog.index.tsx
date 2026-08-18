import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { postsQuery } from "@/lib/queries";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Financial Insights & Articles | ARK Finance Consultancy" },
      {
        name: "description",
        content:
          "Practical articles on home loans, GST and ITR deadlines, insurance cover and investment planning, written for clients in Ahmedabad and Gujarat.",
      },
      { property: "og:title", content: "Financial Insights | ARK Finance Consultancy" },
      {
        property: "og:description",
        content: "Guides and explainers on loans, taxation, insurance and investing in Gujarat.",
      },
    ],
  }),
  component: Blog,
});

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Blog() {
  const posts = useQuery(postsQuery);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Insights"
        title="Notes from our practice"
        intro="Short, practical pieces on the questions clients ask us most often."
      />
      <section className="container-page py-20 sm:py-24">
        {posts.isLoading && <p className="text-sm text-muted-foreground">Loading articles…</p>}
        {posts.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">No articles published yet.</p>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.data?.map((post) => (
            <article
              key={post.id}
              className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-transform hover:-translate-y-1"
            >
              {post.cover_url && (
                <img
                  src={post.cover_url}
                  alt={post.title}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="flex flex-1 flex-col p-7">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5 text-accent" aria-hidden />
                  {formatDate(post.published_at)}
                </p>
                <h2 className="mt-3 text-lg font-semibold leading-snug text-primary">
                  {post.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  Read article
                  <ArrowRight
                    className="size-4 text-accent transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
