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
import { adminLegalQuery } from "@/lib/admin/queries";
import { adminDeleteLegal, adminSaveLegal } from "@/routes/api/-admin-pages";

export const Route = createFileRoute("/admin/legal")({
  loader: () => requireEditor(),
  component: LegalPage,
});

function LegalPage() {
  const queryClient = useQueryClient();
  const legal = useQuery(adminLegalQuery);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ id: "", slug: "", title: "", intro: "", body: "" });
  const [saving, setSaving] = useState(false);

  const open = (row: any) => {
    setEditing(row);
    setForm({
      id: row.id,
      slug: row.slug,
      title: row.title,
      intro: row.intro ?? "",
      body: row.body ?? "",
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await adminSaveLegal({ data: form as never });
      toast.success("Page saved");
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "legal"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message.replace(/^Error: /, "") : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Legal pages"
        description="The Privacy Policy and Terms of Service, served at /privacy and /terms."
      />

      {legal.isLoading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : (legal.data ?? []).length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 p-10 text-center text-sm text-zinc-500">
          No legal pages yet.
        </div>
      ) : (
        <div className="space-y-2">
          {(legal.data ?? []).map((row: any) => (
            <div
              key={row.id}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-100">{row.title}</p>
                <p className="text-xs text-zinc-500">/{row.slug}</p>
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
                title="Delete this legal page?"
                description={`/${row.slug} will no longer be served from the CMS.`}
                confirmLabel="Delete"
                onConfirm={async () => {
                  try {
                    await adminDeleteLegal({ data: { id: row.id } });
                    toast.success("Legal page deleted");
                    queryClient.invalidateQueries({ queryKey: ["admin", "legal"] });
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
            <DialogTitle>Edit legal page</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Use ## headings and paragraphs. {`{public_email}`}, {`{address_line1}`} etc. are
              replaced with your site settings.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm text-zinc-300">Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="mt-1.5 bg-white/5 text-zinc-100"
                  />
                </div>
                <div>
                  <Label className="text-sm text-zinc-300">Page title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-1.5 bg-white/5 text-zinc-100"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm text-zinc-300">Intro</Label>
                <Input
                  value={form.intro}
                  onChange={(e) => setForm({ ...form, intro: e.target.value })}
                  className="mt-1.5 bg-white/5 text-zinc-100"
                />
              </div>
              <div>
                <Label className="text-sm text-zinc-300">Body</Label>
                <Textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={18}
                  className="mt-1.5 bg-white/5 font-mono text-sm text-zinc-100"
                />
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
