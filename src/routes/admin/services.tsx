import { createFileRoute } from "@tanstack/react-router";
import { EntityCrudPage, type EntityCrudConfig } from "@/components/admin/EntityCrudPage";
import { requireEditor } from "@/lib/admin/guard";
import { adminServicesQuery } from "@/lib/admin/queries";
import { adminDeleteService, adminReorderServices, adminSaveService } from "@/routes/api/-admin-content";

const config: EntityCrudConfig = {
  title: "Services",
  description: "The four practice areas shown on the home page and the services page. Order decides placement.",
  queryOptions: adminServicesQuery,
  fields: [
    { name: "title", label: "Service name", type: "text", required: true, maxLength: 120, placeholder: "Loan Financing" },
    { name: "slug", label: "Slug (URL)", type: "text", maxLength: 140, placeholder: "leave blank to auto-generate", hint: "Used in the URL anchor (#slug). Auto-generated from the name if empty." },
    { name: "summary", label: "Short summary", type: "textarea", maxLength: 400, placeholder: "One line shown in cards." },
    { name: "description", label: "Full description", type: "textareaLg", maxLength: 4000 },
    {
      name: "icon",
      label: "Icon",
      type: "select",
      options: [
        { label: "Landmark (loans)", value: "Landmark" },
        { label: "ShieldCheck (insurance)", value: "ShieldCheck" },
        { label: "FileText (tax)", value: "FileText" },
        { label: "TrendingUp (investment)", value: "TrendingUp" },
      ],
    },
    { name: "features", label: "Key features", type: "features", hint: "Each line becomes a bullet on the service page." },
    { name: "image_url", label: "Image URL", type: "text", maxLength: 500, placeholder: "/services/loan-financing.webp" },
    { name: "image_alt", label: "Image alt text", type: "text", maxLength: 300 },
    { name: "is_published", label: "Visible on the public site", type: "boolean" },
    { name: "sort_order", label: "Order", type: "number" },
  ],
  defaults: { title: "", slug: "", summary: "", description: "", icon: "Landmark", features: [], image_url: "", image_alt: "", is_published: true, sort_order: 0 },
  listLabel: (s) => (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-zinc-100">{s.title}</p>
      <p className="truncate text-xs text-zinc-500">{s.summary || "No summary"}</p>
    </div>
  ),
  onSave: (v) => adminSaveService({ data: v }),
  onDelete: (id) => adminDeleteService({ data: id }),
  onReorder: (ids) => adminReorderServices({ data: { ids } }),
  toggleField: "is_published",
};

export const Route = createFileRoute("/admin/services")({
  loader: () => requireEditor(),
  component: () => <EntityCrudPage config={config} />,
});