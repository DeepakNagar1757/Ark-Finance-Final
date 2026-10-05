import { createFileRoute } from "@tanstack/react-router";
import { EntityCrudPage, type EntityCrudConfig } from "@/components/admin/EntityCrudPage";
import { requireEditor } from "@/lib/admin/guard";
import { adminStatsQuery } from "@/lib/admin/queries";
import { adminDeleteStat, adminReorderStats, adminSaveStat } from "@/routes/api/-admin-content";

const config: EntityCrudConfig = {
  title: "Stats",
  description: "The numbers displayed in the stats band on the home page.",
  queryOptions: adminStatsQuery,
  fields: [
    { name: "value", label: "Value", type: "text", required: true, maxLength: 30, placeholder: "1,500+" },
    { name: "label", label: "Label", type: "text", required: true, maxLength: 120, placeholder: "Clients served" },
    { name: "is_active", label: "Visible on the public site", type: "boolean" },
    { name: "sort_order", label: "Order", type: "number" },
  ],
  defaults: { value: "", label: "", is_active: true, sort_order: 0 },
  listLabel: (s) => (
    <div className="min-w-0">
      <p className="text-sm font-medium text-zinc-100">
        <span className="font-bold text-teal-300">{s.value}</span> <span className="text-zinc-300">· {s.label}</span>
      </p>
    </div>
  ),
  onSave: (v) => adminSaveStat({ data: v }),
  onDelete: (id) => adminDeleteStat({ data: id }),
  onReorder: (ids) => adminReorderStats({ data: { ids } }),
  toggleField: "is_active",
};

export const Route = createFileRoute("/admin/stats")({
  loader: () => requireEditor(),
  component: () => <EntityCrudPage config={config} />,
});