import { createFileRoute } from "@tanstack/react-router";
import { EntityCrudPage, type EntityCrudConfig } from "@/components/admin/EntityCrudPage";
import { requireEditor } from "@/lib/admin/guard";
import { adminProcessQuery } from "@/lib/admin/queries";
import { adminDeleteProcessStep, adminReorderProcess, adminSaveProcessStep } from "@/routes/api/-admin-content";

const config: EntityCrudConfig = {
  title: "Process steps",
  description: "The three-step process shown on the home page.",
  queryOptions: adminProcessQuery,
  fields: [
    { name: "step", label: "Step number", type: "text", maxLength: 10, placeholder: "01" },
    { name: "title", label: "Step title", type: "text", required: true, maxLength: 120, placeholder: "Requirement Analysis" },
    { name: "body", label: "Description", type: "textarea", maxLength: 1000 },
    { name: "is_active", label: "Visible on the public site", type: "boolean" },
    { name: "sort_order", label: "Order", type: "number" },
  ],
  defaults: { step: "", title: "", body: "", is_active: true, sort_order: 0 },
  listLabel: (s) => (
    <div className="min-w-0">
      <p className="text-sm font-medium text-zinc-100">
        <span className="mr-2 font-mono text-teal-300">{s.step || "–"}</span>
        {s.title}
      </p>
      {s.body ? <p className="truncate text-xs text-zinc-500">{s.body}</p> : null}
    </div>
  ),
  onSave: (v) => adminSaveProcessStep({ data: v }),
  onDelete: (id) => adminDeleteProcessStep({ data: id }),
  onReorder: (ids) => adminReorderProcess({ data: { ids } }),
  toggleField: "is_active",
};

export const Route = createFileRoute("/admin/process")({
  loader: () => requireEditor(),
  component: () => <EntityCrudPage config={config} />,
});