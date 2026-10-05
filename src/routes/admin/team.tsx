import { createFileRoute } from "@tanstack/react-router";
import { EntityCrudPage, type EntityCrudConfig } from "@/components/admin/EntityCrudPage";
import { requireEditor } from "@/lib/admin/guard";
import { adminTeamQuery } from "@/lib/admin/queries";
import { adminDeleteTeamMember, adminReorderTeam, adminSaveTeamMember } from "@/routes/api/-admin-content";

const fields: EntityCrudConfig["fields"] = [
  { name: "name", label: "Full name", type: "text", required: true, maxLength: 120 },
  { name: "designation", label: "Role", type: "text", maxLength: 200, placeholder: "Founder & Principal Consultant" },
  { name: "credential", label: "Credential line", type: "text", maxLength: 200, placeholder: "Founder & Principal Consultant (CAFC Qualified)" },
  { name: "specialization", label: "Specialization", type: "textarea", maxLength: 400 },
  { name: "bio", label: "Bio", type: "textareaLg", maxLength: 2000 },
  { name: "photo_url", label: "Photo URL", type: "text", maxLength: 500, placeholder: "/karan-joshi.png" },
  { name: "is_founder", label: "Founder (featured profile)", type: "boolean" },
  { name: "is_published", label: "Visible on the public site", type: "boolean" },
  { name: "sort_order", label: "Order", type: "number" },
];

const defaults: Record<string, any> = { name: "", designation: "", credential: "", specialization: "", bio: "", photo_url: "", is_founder: false, is_published: true, sort_order: 0 };

function TeamPage() {
  return (
    <EntityCrudPage
      config={{
        title: "Team",
        description: "The professionals featured on the About page. Only one member should be marked as founder.",
        queryOptions: adminTeamQuery,
        fields,
        defaults,
        listLabel: (s) => (
          <div className="flex items-center gap-3">
            {s.photo_url ? (
              <img src={s.photo_url} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : null}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-100">
                {s.name}
                {s.is_founder ? <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">Founder</span> : null}
              </p>
              <p className="truncate text-xs text-zinc-500">{s.designation || "—"}</p>
            </div>
          </div>
        ),
        onSave: (v) => adminSaveTeamMember({ data: v }),
        onDelete: (id) => adminDeleteTeamMember({ data: id }),
        onReorder: (ids) => adminReorderTeam({ data: { ids } }),
        toggleField: "is_published",
      }}
    />
  );
}

export const Route = createFileRoute("/admin/team")({
  loader: () => requireEditor(),
  component: TeamPage,
});