import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Eye, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { requireEditor } from "@/lib/admin/guard";
import { adminGetPost, adminSavePost } from "@/routes/api/-admin-posts";
import { MediaPicker } from "@/components/admin/MediaPicker";

export const Route = createFileRoute("/admin/posts/$id")({
  loader: () => requireEditor(),
  component: PostEditor,
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 200);
}

function PostEditor() {
  const { id } = Route.useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isNew = id === "new";

  const existing = useQuery({
    queryKey: ["admin", "post", id],
    queryFn: () => adminGetPost({ data: { id } }),
    enabled: !isNew,
  });

  const [form, setForm] = useState(() => ({
    title: "",
    slug: "",
    category: "Finance",
    status: "published",
    tags: "",
    excerpt: "",
    content: "",
    cover_url: "",
    og_image: "",
    seo_title: "",
    seo_description: "",
    published_at: "",
  }));
  const [saving, setSaving] = useState(false);
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (existing.data) {
      const p = existing.data;
      setForm({
        title: p.title ?? "",
        slug: p.slug ?? "",
        category: p.category ?? "Finance",
        status: p.status ?? "published",
        tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
        excerpt: p.excerpt ?? "",
        content: p.content ?? "",
        cover_url: p.cover_url ?? "",
        og_image: p.og_image ?? "",
        seo_title: p.seo_title ?? "",
        seo_description: p.seo_description ?? "",
        published_at: p.published_at ? p.published_at.slice(0, 16) : "",
      });
    }
  }, [existing.data]);

  const setField = (name: string, value: string) =>
    setForm((f) => {
      const next = { ...f, [name]: value };
      if (name === "title" && !slugManual) next.slug = slugify(value);
      return next;
    });

  const save = async () => {
    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const published_at = form.published_at
        ? new Date(form.published_at).toISOString()
        : undefined;
      await adminSavePost({
        data: {
          id: isNew ? undefined : id,
          title: form.title,
          slug: form.slug,
          category: form.category,
          status: form.status as "draft" | "scheduled" | "published",
          tags,
          excerpt: form.excerpt,
          content: form.content,
          cover_url: form.cover_url || undefined,
          og_image: form.og_image || undefined,
          seo_title: form.seo_title,
          seo_description: form.seo_description,
          published_at,
        },
      });
      toast.success(isNew ? "Post created" : "Changes saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      await router.navigate({ to: "/admin/posts" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message.replace(/^Error: /, "") : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && existing.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading post…
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/admin/posts" className="text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-zinc-100">{isNew ? "New post" : "Edit post"}</h1>
        {!isNew && form.slug ? (
          <Link to="/blog/$slug" params={{ slug: form.slug }} target="_blank" className="ml-auto flex items-center gap-1.5 text-sm text-teal-300 hover:underline">
            <Eye className="h-4 w-4" /> Preview live
          </Link>
        ) : null}
      </div>

      <div className="space-y-5">
        <div>
          <Label className="text-sm text-zinc-300">Title</Label>
          <Input value={form.title} onChange={(e) => setField("title", e.target.value)} className="mt-1.5 bg-white/5 text-zinc-100" />
        </div>
        <div>
          <Label className="text-sm text-zinc-300">Slug</Label>
          <Input
            value={form.slug}
            onChange={(e) => {
              setSlugManual(true);
              setField("slug", e.target.value);
            }}
            className="mt-1.5 bg-white/5 font-mono text-sm text-zinc-100"
            placeholder="auto-generated-from-title"
          />
          <p className="mt-1 text-xs text-zinc-500">Auto-generated from title. Edit only if you want a custom URL.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label className="text-sm text-zinc-300">Category</Label>
            <Input value={form.category} onChange={(e) => setField("category", e.target.value)} className="mt-1.5 bg-white/5 text-zinc-100" />
          </div>
          <div>
            <Label className="text-sm text-zinc-300">Status</Label>
            <Select value={form.status} onValueChange={(v) => setField("status", v)}>
              <SelectTrigger className="mt-1.5 bg-white/5 text-zinc-100"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {form.status === "scheduled" ? (
          <div>
            <Label className="text-sm text-zinc-300">Schedule publish date & time</Label>
            <Input
              type="datetime-local"
              value={form.published_at}
              onChange={(e) => setField("published_at", e.target.value)}
              className="mt-1.5 bg-white/5 text-zinc-100"
            />
          </div>
        ) : null}
        <div>
          <Label className="text-sm text-zinc-300">Tags (comma-separated)</Label>
          <Input value={form.tags} onChange={(e) => setField("tags", e.target.value)} placeholder="GST, taxation, deadlines" className="mt-1.5 bg-white/5 text-zinc-100" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-sm text-zinc-300">Cover image</Label>
            <MediaPicker
              onSelect={(url) => setField("cover_url", url)}
            />
          </div>
          <Input value={form.cover_url} onChange={(e) => setField("cover_url", e.target.value)} placeholder="/blog/your-image.webp" className="mt-1.5 bg-white/5 text-zinc-100" />
          {form.cover_url ? <img src={form.cover_url} alt="" className="mt-2 h-32 w-full rounded-lg border border-white/10 object-cover" /> : null}
        </div>
        <div>
          <Label className="text-sm text-zinc-300">Excerpt</Label>
          <Textarea value={form.excerpt} onChange={(e) => setField("excerpt", e.target.value)} maxLength={500} rows={3} className="mt-1.5 bg-white/5 text-zinc-100" />
          <p className="mt-1 text-xs text-zinc-500">{form.excerpt.length}/500 characters.</p>
        </div>
        <div>
          <Label className="text-sm text-zinc-300">Content</Label>
          <Textarea value={form.content} onChange={(e) => setField("content", e.target.value)} rows={20} className="mt-1.5 bg-white/5 font-mono text-sm leading-relaxed text-zinc-100" />
          <p className="mt-1 text-xs text-zinc-500">
            Use ## headings, **bold**, *italic*, - bullet lists. The first paragraph after a heading becomes the reading section.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label className="text-sm text-zinc-300">SEO title (optional)</Label>
            <Input value={form.seo_title} onChange={(e) => setField("seo_title", e.target.value)} maxLength={200} className="mt-1.5 bg-white/5 text-zinc-100" />
            <p className="mt-1 text-xs text-zinc-500">{form.seo_title.length}/200</p>
          </div>
          <div>
            <Label className="text-sm text-zinc-300">SEO description (optional)</Label>
            <Textarea value={form.seo_description} onChange={(e) => setField("seo_description", e.target.value)} maxLength={320} rows={3} className="mt-1.5 bg-white/5 text-zinc-100" />
            <p className="mt-1 text-xs text-zinc-500">{form.seo_description.length}/320</p>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-sm text-zinc-300">Open Graph image (optional)</Label>
            <MediaPicker onSelect={(url) => setField("og_image", url)} />
          </div>
          <Input value={form.og_image} onChange={(e) => setField("og_image", e.target.value)} placeholder="/blog/og/your-image.webp" className="mt-1.5 bg-white/5 text-zinc-100" />
          {form.og_image ? <img src={form.og_image} alt="" className="mt-2 h-28 w-full rounded-lg border border-white/10 object-cover" /> : null}
        </div>
      </div>

      <div className="sticky bottom-4 mt-8 flex justify-end gap-2">
        <Link to="/admin/posts">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
          Save
        </Button>
      </div>
    </div>
  );
}