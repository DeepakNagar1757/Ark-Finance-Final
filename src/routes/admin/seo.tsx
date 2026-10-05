import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { PageHeader, ConfirmButton } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { requireEditor } from "@/lib/admin/guard";
import { adminSeoQuery } from "@/lib/admin/queries";
import { adminDeleteSeo, adminSaveSeo } from "@/routes/api/-admin-pages";
import { MediaPicker } from "@/components/admin/MediaPicker";

export const Route = createFileRoute("/admin/seo")({
  loader: () => requireEditor(),
  component: SeoPage,
});

function SeoPage() {
  const queryClient = useQueryClient();
  const seo = useQuery(adminSeoQuery);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({
    route: "",
    title: "",
    description: "",
    robots: "index, follow",
    og_image: "",
  });
  const [saving, setSaving] = useState(false);

  const open = (row: any) => {
    setEditing(row);
    setForm({
      id: row.id,
      route: row.route,
      title: row.title ?? "",
      description: row.description ?? "",
      robots: row.robots ?? "index, follow",
      og_image: row.og_image ?? "",
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await adminSaveSeo({ data: form as never });
      toast.success("SEO saved");
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "seo"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message.replace(/^Error: /, "") : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="SEO & meta"
        description="Search-engine titles and descriptions for each page of the site. These decide how your site appears in Google results."
      />

      {seo.isLoading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : (seo.data ?? []).length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 p-10 text-center text-sm text-zinc-500">
          No SEO entries yet. They can be created from the Pages section.
        </div>
      ) : (
        <div className="space-y-2">
          {(seo.data ?? []).map((row: any) => (
            <div
              key={row.id}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-medium text-teal-300">{row.route}</p>
                <p className="truncate text-sm text-zinc-100">{row.title}</p>
                <p className="truncate text-xs text-zinc-400">{row.description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400"
                onClick={() => open(row)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <ConfirmButton
                title="Delete this SEO entry?"
                description={`Meta tags for ${row.route} will be removed. The page will fall back to defaults.`}
                confirmLabel="Delete"
                onConfirm={async () => {
                  try {
                    await adminDeleteSeo({ data: { id: row.id } });
                    toast.success("SEO entry deleted");
                    queryClient.invalidateQueries({ queryKey: ["admin", "seo"] });
                  } catch {
                    toast.error("Could not delete");
                  }
                }}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-300/80 hover:text-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-[#0f1729] text-zinc-100">
          <DialogHeader>
            <DialogTitle>Edit SEO — {form.route}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Titles should be under 60 characters; descriptions under 160 for best results.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-zinc-300">Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={200}
                  className="mt-1.5 bg-white/5 text-zinc-100"
                />
                <p className="mt-1 text-xs text-zinc-500">{form.title.length}/200</p>
              </div>
              <div>
                <Label className="text-sm text-zinc-300">Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={400}
                  rows={3}
                  className="mt-1.5 bg-white/5 text-zinc-100"
                />
                <p className="mt-1 text-xs text-zinc-500">{form.description.length}/400</p>
              </div>
              <div>
                <Label className="text-sm text-zinc-300">Robots</Label>
                <Input
                  value={form.robots}
                  onChange={(e) => setForm({ ...form, robots: e.target.value })}
                  className="mt-1.5 bg-white/5 text-zinc-100"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-zinc-300">Open Graph image (optional)</Label>
                  <MediaPicker onSelect={(url) => setForm({ ...form, og_image: url })} />
                </div>
                <Input
                  value={form.og_image}
                  onChange={(e) => setForm({ ...form, og_image: e.target.value })}
                  className="mt-1.5 bg-white/5 text-zinc-100"
                />
                {form.og_image ? (
                  <img
                    src={form.og_image}
                    alt=""
                    className="mt-2 h-28 w-full rounded-lg border border-white/10 object-cover"
                  />
                ) : null}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null} Save
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
