import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, Plus, Check, Eye, EyeOff } from "lucide-react";
import { PageHeader, ConfirmButton } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { adminSectionsQuery } from "@/lib/admin/queries";
import { adminDeleteSection, adminSaveSection } from "@/routes/api/-admin-pages";

export const Route = createFileRoute("/admin/pages")({
  loader: () => requireEditor(),
  component: PagesPage,
});

const PAGES = [
  { value: "home", label: "Home" },
  { value: "about", label: "About" },
  { value: "services", label: "Services" },
  { value: "testimonials", label: "Testimonials" },
  { value: "contact", label: "Contact" },
];

type Section = {
  id?: string;
  page: string;
  section_key: string;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  body?: string;
  cta_label?: string;
  cta_target?: string;
  media_url?: string | null;
  align?: string;
  is_active?: boolean;
  sort_order?: number;
};

const FIELDS: { key: keyof Section; label: string; type: "text" | "textarea" | "textareaLg"; hint?: string }[] = [
  { key: "eyebrow", label: "Eyebrow (small label above heading)", type: "text" },
  { key: "heading", label: "Heading", type: "text" },
  { key: "intro", label: "Intro paragraph", type: "textarea" },
  { key: "body", label: "Body content", type: "textareaLg", hint: "Long-form content with ## headings. Each ## line starts a new section." },
  { key: "cta_label", label: "Button label", type: "text" },
  { key: "cta_target", label: "Button link", type: "text", hint: "Leave empty to use WhatsApp." },
  { key: "media_url", label: "Media URL (optional)", type: "text" },
];

function SectionForm({
  section,
  into,
  onClose,
}: {
  section: Section;
  into: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Section>({ ...section, page: section.page || into });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof Section, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await adminSaveSection({ data: form as never });
      toast.success("Section saved");
      onClose();
      queryClient.invalidateQueries({ queryKey: ["admin", "sections"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message.replace(/^Error: /, "") : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm text-zinc-300">Section key (internal)</Label>
        <Input
          value={form.section_key}
          onChange={(e) => set("section_key", e.target.value)}
          className="mt-1.5 bg-white/5 font-mono text-sm text-zinc-100"
          placeholder="hero_eyebrow"
        />
        <p className="mt-1 text-xs text-zinc-500">Used by the website to know where to place this text. Don't change it unless you know what you're doing.</p>
      </div>
      {FIELDS.map((field) =>
        field.type === "textarea" || field.type === "textareaLg" ? (
          <div key={field.key}>
            <Label className="text-sm text-zinc-300">{field.label}</Label>
            <Textarea
              value={(form[field.key] as string) ?? ""}
              onChange={(e) => set(field.key, e.target.value)}
              rows={field.type === "textareaLg" ? 10 : 3}
              className="mt-1.5 bg-white/5 text-zinc-100"
            />
            {field.hint ? <p className="mt-1 text-xs text-zinc-500">{field.hint}</p> : null}
          </div>
        ) : (
          <div key={field.key}>
            <Label className="text-sm text-zinc-300">{field.label}</Label>
            <Input
              value={(form[field.key] as string) ?? ""}
              onChange={(e) => set(field.key, e.target.value)}
              className="mt-1.5 bg-white/5 text-zinc-100"
            />
            {field.hint ? <p className="mt-1 text-xs text-zinc-500">{field.hint}</p> : null}
          </div>
        ),
      )}
      <div>
        <Label className="text-sm text-zinc-300">Text alignment</Label>
        <Select value={form.align ?? "left"} onValueChange={(v) => set("align", v as "left" | "center")}>
          <SelectTrigger className="mt-1.5 bg-white/5 text-zinc-100"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
        <span className="text-sm font-medium text-zinc-200">Visible on the public site</span>
        <Switch checked={form.is_active !== false} onCheckedChange={(v) => set("is_active", v)} />
      </div>
      <div>
        <Label className="text-sm text-zinc-300">Order</Label>
        <Input type="number" value={form.sort_order ?? 0} onChange={(e) => set("sort_order", parseInt(e.target.value, 10) || 0)} className="mt-1.5 bg-white/5 text-zinc-100" />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}
          Save
        </Button>
      </DialogFooter>
    </div>
  );
}

function PagesPage() {
  const [tabs] = useState(PAGES);
  const [activePage, setActivePage] = useState("home");
  const [editing, setEditing] = useState<Section | null>(null);
  const queryClient = useQueryClient();

  const sections = useQuery(adminSectionsQuery(activePage));

  const toggle = async (s: Section) => {
    try {
      await adminSaveSection({ data: { ...s, is_active: !(s.is_active !== false) } as never });
      queryClient.invalidateQueries({ queryKey: ["admin", "sections"] });
    } catch {
      toast.error("Could not toggle");
    }
  };

  return (
    <div>
      <PageHeader
        title="Page editing"
        description="Edit the headings, intros and buttons that appear on your most important pages."
        actions={
          <Button size="sm" onClick={() => setEditing({ page: activePage, section_key: "", eyebrow: "", heading: "", intro: "", body: "", cta_label: "", cta_target: "", media_url: "", align: "left", is_active: true, sort_order: 0 })}>
            <Plus className="mr-1 h-4 w-4" /> Add section
          </Button>
        }
      />

      <Tabs value={activePage} onValueChange={setActivePage} className="mb-6">
        <TabsList className="bg-white/5 text-zinc-400">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            {sections.isLoading ? (
              <div className="flex items-center justify-center py-12 text-zinc-400">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
              </div>
            ) : (sections.data ?? []).length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/15 p-8 text-center text-sm text-zinc-500">
                No sections for this page yet.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {(sections.data ?? []).map((s: Section) => (
                  <div key={s.id || s.section_key} className={`rounded-lg border border-white/10 bg-white/5 p-4 ${s.is_active === false ? "opacity-50" : ""}`}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="font-mono text-xs text-teal-300">{s.section_key}</p>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400" onClick={() => toggle(s)} title={s.is_active === false ? "Hidden" : "Visible"}>
                          {s.is_active === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400" onClick={() => setEditing({ ...s })}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <ConfirmButton
                          title="Delete this section?"
                          description={s.section_key}
                          onConfirm={async () => {
                            await adminDeleteSection({ data: { id: s.id! } });
                            toast.success("Section deleted");
                            queryClient.invalidateQueries({ queryKey: ["admin", "sections"] });
                          }}
                          trigger={
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400/80">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                    {s.eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{s.eyebrow}</p> : null}
                    {s.heading ? <p className="text-sm font-semibold text-zinc-100">{s.heading}</p> : null}
                    {s.intro ? <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{s.intro}</p> : null}
                    {s.cta_label ? <p className="mt-1 text-xs text-teal-300">{s.cta_label}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-[#0f1729] text-zinc-100">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit section" : "Add section"}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Changes become visible on the public site immediately.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <SectionForm section={editing} into={activePage} onClose={() => setEditing(null)} />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}