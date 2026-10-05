import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Plus, Loader2, Pencil, Eye, Trash2 } from "lucide-react";
import { PageHeader, ConfirmButton } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireEditor } from "@/lib/admin/guard";
import { adminPostsQuery } from "@/lib/admin/queries";
import { adminDeletePost } from "@/routes/api/-admin-posts";

export const Route = createFileRoute("/admin/posts")({
  loader: () => requireEditor(),
  component: PostsPage,
});

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  draft: "bg-zinc-500/15 text-zinc-300 border-zinc-400/30",
  scheduled: "bg-amber-500/15 text-amber-300 border-amber-400/30",
};

function PostsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const posts = useQuery(adminPostsQuery(debounced, page));

  const total = posts.data?.total ?? 0;
  const rows = posts.data?.rows ?? [];
  const pages = Math.max(1, Math.ceil(total / (posts.data?.pageSize ?? 25)));

  return (
    <div>
      <PageHeader
        title="Blog posts"
        description="Write, edit and publish articles. Drafts and scheduled posts are hidden from visitors."
        actions={
          <Link to={("/admin/posts/new" as never)}>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> New post
            </Button>
          </Link>
        }
      />

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts…"
          className="bg-white/5 pl-9 text-zinc-100"
        />
      </div>

      {posts.isLoading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading posts…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 p-10 text-center text-sm text-zinc-500">
          No posts yet. Click “New post” to write your first article.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((post: any) => (
            <div key={post.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-zinc-100">{post.title}</p>
                  <Badge className={`border text-[10px] ${STATUS_STYLES[post.status]}`}>{post.status}</Badge>
                </div>
                <p className="truncate text-xs text-zinc-500">
                  {post.category} · {new Date(post.published_at ?? post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              {post.status === "published" ? (
                <Link to="/blog/$slug" params={{ slug: post.slug }} target="_blank" className="text-zinc-500 hover:text-zinc-200">
                  <Eye className="h-4 w-4" />
                </Link>
              ) : null}
              <Link to="/admin/posts/$id" params={{ id: post.id }}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <ConfirmButton
                title="Delete this post?"
                description="The article and its URL will be removed permanently."
                onConfirm={async () => {
                  await adminDeletePost({ data: { id: post.id } });
                  toast.success("Post deleted");
                  queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
                  queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
                }}
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400/80">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          ))}
        </div>
      )}

      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-zinc-500">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}