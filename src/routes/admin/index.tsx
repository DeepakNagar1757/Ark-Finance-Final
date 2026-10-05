import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Loader2,
  Inbox,
  Users,
  FileText,
  TrendingUp,
  UserPlus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminDashboardQuery } from "@/lib/admin/queries";
import { requireEditor } from "@/lib/admin/guard";
import type { AdminUser } from "@/lib/admin/guard";
import { LEAD_STATUSES } from "@/routes/api/-admin-leads";

export const Route = createFileRoute("/admin/")({
  loader: () => requireEditor(),
  component: DashboardPage,
});

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-300 border-blue-400/30",
  contacted: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  quoted: "bg-purple-500/15 text-purple-300 border-purple-400/30",
  converted: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  closed: "bg-zinc-500/15 text-zinc-300 border-zinc-400/30",
};

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; sub?: string }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-500/15 text-teal-300">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-zinc-100">{value}</p>
          <p className="text-xs text-zinc-400">{label}</p>
          {sub ? <p className="text-[11px] text-zinc-500">{sub}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const user = Route.useLoaderData() as AdminUser;
  const data = useQuery(adminDashboardQuery);

  if (data.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-zinc-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading…
      </div>
    );
  }

  const d = data.data!;

  return (
    <div>
      <PageHeader
        title={`Welcome back${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Here's what's happening on your site."
        actions={
          user.role === "admin" ? (
            <Badge className="gap-1 border-amber-400/30 bg-amber-500/15 text-amber-300">
              <Sparkles className="h-3 w-3" /> Administrator
            </Badge>
          ) : (
            <Badge className="border-white/10 bg-white/5 text-zinc-300">Editor</Badge>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="New leads this week" value={d.newLeadsThisWeek} icon={TrendingUp} />
        <StatCard label="Total leads" value={d.totalLeads} icon={Inbox} sub="last 200 tracked" />
        <StatCard label="Newsletter subscribers" value={d.subscribers} icon={UserPlus} />
        <StatCard label="Published posts" value={d.publishedPosts} icon={FileText} sub={`${d.draftPosts} draft / scheduled`} />
        <StatCard label="Services" value={d.servicesCount} icon={Sparkles} />
        <StatCard label="Signed in as" value={user.role} icon={Users} sub={user.email} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-200">Lead funnel</CardTitle>
            <Link to="/admin/leads" className="inline-flex items-center gap-1 text-xs text-teal-300 hover:underline">
              Open inbox <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {LEAD_STATUSES.map((status) => {
                const count = d.leadsByStatus[status] ?? 0;
                const pct = d.totalLeads ? Math.round((count / d.totalLeads) * 100) : 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <Badge className={`w-24 justify-center border ${STATUS_STYLES[status]}`}>{status}</Badge>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-teal-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-sm text-zinc-300">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-200">Recent leads</CardTitle>
          </CardHeader>
          <CardContent>
            {d.recentLeads.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-500">No leads yet.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {d.recentLeads.map((lead) => (
                  <li key={lead.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-100">
                        {lead.name}
                        <span className="ml-2 text-xs font-normal text-zinc-500">{lead.service}</span>
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <Badge className={`border ${STATUS_STYLES[lead.status]}`}>{lead.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}