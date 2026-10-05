import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { PageHeader, InfoBanner } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin/guard";
import type { AdminUser } from "@/lib/admin/guard";
import { adminSettingsQuery } from "@/lib/admin/queries";
import { adminSaveSettings } from "@/routes/api/-admin-pages";

export const Route = createFileRoute("/admin/settings")({
  loader: () => requireAdmin(),
  component: SettingsPage,
});

const DEFAULTS: Record<string, string> = {
  firm_name: "ARK Finance Consultancy",
  short_name: "ARK Finance",
  tagline: "Solution to every financial problem",
  logo_url: "/ark-logo.png",
  phone: "",
  phone_href: "",
  whatsapp_number: "",
  whatsapp_message: "",
  public_email: "",
  address_line1: "",
  address_line2: "",
  address_area: "",
  address_region: "",
  maps_link: "",
  office_hours: "",
  footer_blurb: "",
  footer_copyright: "",
  founder_name: "",
  founder_title: "",
};

function SettingsPage() {
  const user = Route.useLoaderData() as AdminUser;
  const queryClient = useQueryClient();
  const settings = useQuery(adminSettingsQuery);
  const [form, setForm] = useState<Record<string, string>>({ ...DEFAULTS });
  const [established, setEstablished] = useState<string>("2026");
  const [social, setSocial] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings.data) {
      setForm({
        firm_name: settings.data["firm_name"] ?? "ARK Finance Consultancy",
        short_name: settings.data["short_name"] ?? "ARK Finance",
        tagline: settings.data["tagline"] ?? "Solution to every financial problem",
        logo_url: settings.data["logo_url"] ?? "/ark-logo.png",
        phone: settings.data.phone ?? "",
        phone_href: settings.data.phone_href ?? "",
        whatsapp_number: settings.data.whatsapp_number ?? "",
        whatsapp_message: settings.data.whatsapp_message ?? "",
        public_email: settings.data.public_email ?? "",
        address_line1: settings.data.address_line1 ?? "",
        address_line2: settings.data.address_line2 ?? "",
        address_area: settings.data.address_area ?? "",
        address_region: settings.data.address_region ?? "",
        maps_link: settings.data.maps_link ?? "",
        office_hours: settings.data.office_hours ?? "",
        footer_blurb: settings.data.footer_blurb ?? "",
        footer_copyright: settings.data.footer_copyright ?? "",
        founder_name: settings.data.founder_name ?? "",
        founder_title: settings.data.founder_title ?? "",
      });
      setEstablished(
        settings.data.established_year ? String(settings.data.established_year) : "2026",
      );
      setSocial((settings.data.social_links as Record<string, string>) ?? {});
    }
  }, [settings.data]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const social_links = Object.fromEntries(
        Object.entries(social)
          .map(([k, v]) => [k.trim(), (v ?? "").trim()])
          .filter(([k, v]) => k.length > 0 && v.length > 0),
      );
      await adminSaveSettings({
        data: {
          ...form,
          phone_href: form["phone_href"] || `tel:${(form["phone"] ?? "").replace(/[^+\d]/g, "")}`,
          established_year: parseInt(established, 10) || 2026,
          social_links,
        } as never,
      });
      toast.success("Settings saved — the whole site updates");
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "sections"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message.replace(/^Error: /, "") : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  if (settings.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }

  const group = (title: string, children: React.ReactNode) => (
    <section className="rounded-xl border border-white/10 bg-white/5 p-5">
      <h2 className="mb-4 text-sm font-semibold text-zinc-200">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
  const field = (label: string, key: string, placeholder?: string) => (
    <div>
      <Label className="text-sm text-zinc-300">{label}</Label>
      <Input
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 bg-white/5 text-zinc-100"
      />
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Site settings"
        description="Business details shown across the website — phone, address, hours and branding."
        actions={
          <Button onClick={save} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            Save settings
          </Button>
        }
      />

      {settings.data?.notes ? <InfoBanner message={String(settings.data.notes)} /> : null}

      <div className="mb-6 flex items-center gap-2">
        <Badge className="border-white/10 bg-white/5 text-zinc-300">Anyone can edit these</Badge>
        <Badge className="border-amber-400/30 bg-amber-500/15 text-amber-300">
          {user.role} signed in
        </Badge>
      </div>

      <div className="space-y-5">
        {group(
          "Business identity",
          <>
            {field("Company name", "firm_name")}
            {field("Short name", "short_name")}
            {field("Tagline", "tagline")}
            {field("Logo URL", "logo_url", "/ark-logo.png")}
            {field("Founder name", "founder_name")}
            {field("Founder title", "founder_title")}
          </>,
        )}
        {group(
          "Contact details",
          <>
            {field("Phone (display)", "phone", "+91 63513 77101")}
            {field("Phone link (tel:)", "phone_href", "tel:+916351377101")}
            {field("WhatsApp number", "whatsapp_number", "916351377101")}
            {field("WhatsApp message", "whatsapp_message")}
            {field("Public email", "public_email", "arkfinance211@gmail.com")}
          </>,
        )}
        {group(
          "Address",
          <>
            {field("Line 1", "address_line1", "203, RM Arcade")}
            {field("Line 2", "address_line2")}
            {field("Area", "address_area", "Vastral, Ahmedabad")}
            {field("Region", "address_region", "Gujarat, India")}
            {field("Google Maps link", "maps_link")}
            {field("Year established", "established_year")}
          </>,
        )}
        {group(
          "Working hours & footer",
          <>
            <div>
              <Label className="text-sm text-zinc-300">Office hours</Label>
              <Input
                value={form["office_hours"]}
                onChange={(e) => set("office_hours", e.target.value)}
                className="mt-1.5 bg-white/5 text-zinc-100"
                placeholder="Monday – Saturday, 10:00 AM – 7:00 PM"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Shown on the contact page and in the hero.
              </p>
            </div>
            <div>
              <Label className="text-sm text-zinc-300">Footer copyright</Label>
              <Input
                value={form["footer_copyright"]}
                onChange={(e) => set("footer_copyright", e.target.value)}
                className="mt-1.5 bg-white/5 text-zinc-100"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-sm text-zinc-300">Footer blurb</Label>
              <Textarea
                value={form["footer_blurb"]}
                onChange={(e) => set("footer_blurb", e.target.value)}
                rows={3}
                maxLength={2000}
                className="mt-1.5 bg-white/5 text-zinc-100"
              />
              <p className="mt-1 text-xs text-zinc-500">
                {(form["footer_blurb"] ?? "").length}/2000
              </p>
            </div>
          </>,
        )}
        {group(
          "Social links",
          <>
            {(["linkedin", "instagram", "facebook", "x", "youtube"] as const).map((key) => (
              <div key={key}>
                <Label className="text-sm capitalize text-zinc-300">
                  {key === "x" ? "X / Twitter" : key}
                </Label>
                <Input
                  value={social[key] ?? ""}
                  onChange={(e) => setSocial((s) => ({ ...s, [key]: e.target.value }))}
                  placeholder={`https://${key === "x" ? "x.com" : key + ".com"}/...`}
                  className="mt-1.5 bg-white/5 text-zinc-100"
                />
              </div>
            ))}
            <p className="sm:col-span-2 text-xs text-zinc-500">
              Leave a field blank to hide that social icon. Saved with site settings.
            </p>
          </>,
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1 h-4 w-4" />
          )}
          Save settings
        </Button>
      </div>
    </div>
  );
}
