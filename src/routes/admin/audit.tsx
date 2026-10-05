import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin/guard";
import type { AdminUser } from "@/lib/admin/guard";
import { adminAuditQuery } from "@/lib/admin/queries";

export const Route = createFileRoute("/admin/audit")({
  loader: () => requireAdmin(),
  component: AuditPage,
});

const ACTION_STYLES: Record<string, string> = {
  login: "bg-blue-500/15 text-blue-300 border-blue-400/30",
  logout: "bg-zinc-500/15 text-zinc-300 border-zinc-400/30",
  create: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  update: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  save: "bg-teal-500/15 text-teal-300 border-teal-400/30",
  delete: "bg-red-500/15 text-red-300 border-red-400/30",
  upload: "bg-purple-500/15 text-purple-300 border-purple-400/30",
};

function AuditPage() {
  const user = Route.useLoaderData() as AdminUser;
  const audit = useQuery(adminAuditQuery);

  return (
    <div>
      <PageHeader
        title="Audit log"
        description={`The last 200 actions recorded in the admin panel (currently signed in as ${user.email}).`}
      />

      {audit.isLoading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : (audit.data ?? []).length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 p-10 text-center text-sm text-zinc-500">
          No activity recorded yet.
        </div>
      ) : (
        <div className="rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-2.5 font-semibold">When</th>
                <th className="px-4 py-2.5 font-semibold">User</th>
                <th className="px-4 py-2.5 font-semibold">Action</th>
                <th className="hidden px-4 py-2.5 font-semibold sm:table-cell">Entity</th>
                <th className="px-4 py-2.5 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {(audit.data ?? []).map((entry: any) => {
                const meta = entry.meta ? JSON.stringify(entry.meta).slice(0, 120) : "";
                return (
                  <tr key={entry.id} className="border-b border-white/5">
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-zinc-400">
                      {new Date(entry.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-300">
                      {(entry.admin_users as any)?.email ?? (entry.admin_users as any)?.name ?? entry.user_role}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge className={`border ${ACTION_STYLES[entry.action] ?? "bg-white/5 text-zinc-300 border-white/10"}`}>
                        {entry.action}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-2.5 font-mono text-xs text-zinc-400 sm:table-cell">{entry.entity}</td>
                    <td className="max-w-[220px] truncate px-4 py-2.5 text-xs text-zinc-500" title={meta}>
                      {meta || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}