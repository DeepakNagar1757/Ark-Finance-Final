import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EntityCrudPage, type EntityCrudConfig } from "@/components/admin/EntityCrudPage";
import { requireEditor } from "@/lib/admin/guard";
import { adminTestimonialsQuery, adminServicesQuery } from "@/lib/admin/queries";
import { adminDeleteTestimonial, adminReorderTestimonials, adminSaveTestimonial } from "@/routes/api/-admin-content";

function TestimonialsPage() {
  const services = useQuery(adminServicesQuery);

  const config: EntityCrudConfig = {
    title: "Testimonials",
    description: "Client reviews. The three marked as “featured” appear on the home page; the rest fill the testimonials page.",
    queryOptions: adminTestimonialsQuery,
    fields: [
      { name: "name", label: "Client name", type: "text", required: true, maxLength: 120 },
      { name: "designation", label: "Role", type: "text", maxLength: 200, placeholder: "Proprietor" },
      { name: "company", label: "Company / location", type: "text", maxLength: 200, placeholder: "Patel Trading Co." },
      { name: "quote", label: "Quote", type: "textareaLg", required: true, maxLength: 2000 },
      { name: "rating", label: "Rating (1–5)", type: "number" },
      {
        name: "service_tag",
        label: "Related service",
        type: "select",
        options: [
          ...(services.data ?? []).map((s: any) => ({ label: s.title, value: s.title })),
          { label: "General", value: "General" },
        ],
      },
      { name: "is_featured", label: "Featured on the home page", type: "boolean" },
      { name: "is_published", label: "Visible on the public site", type: "boolean" },
      { name: "sort_order", label: "Order", type: "number" },
    ],
    defaults: { name: "", designation: "", company: "", quote: "", rating: 5, service_tag: "General", is_featured: false, is_published: true, sort_order: 0 },
    listLabel: (t) => (
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-100">
          {t.name}
          {t.is_featured ? <span className="ml-2 text-[11px] font-semibold text-teal-300">Featured</span> : null}
          <span className="ml-2 text-xs font-normal text-amber-300">{"★".repeat(t.rating || 0)}</span>
        </p>
        <p className="truncate text-xs text-zinc-500">
          {t.designation ? `${t.designation}, ` : ""}{t.company} · {t.service_tag}
        </p>
      </div>
    ),
    onSave: (v) => adminSaveTestimonial({ data: v }),
    onDelete: (id) => adminDeleteTestimonial({ data: id }),
    onReorder: (ids) => adminReorderTestimonials({ data: { ids } }),
    toggleField: "is_published",
  };

  return <EntityCrudPage config={config} />;
}

export const Route = createFileRoute("/admin/testimonials")({
  loader: () => requireEditor(),
  component: TestimonialsPage,
});