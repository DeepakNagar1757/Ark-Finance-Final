import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Download, Loader2, Phone, Mail, Trash2, Star } from "lucide-react";
import { PageHeader, ConfirmButton } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { requireEditor } from "@/lib/admin/guard";
import type { AdminUser } from "@/lib/admin/guard";
import {
  adminLeadsPageQuery,
  adminLeadsSummaryQuery,
  adminServicesQuery,
  adminUsersQuery,
} from "@/lib/admin/queries";
import {
  LEAD_STATUSES,
  adminDeleteLead,
  adminExportLeads,
  adminUpdateLead,
} from "@/routes/api/-admin-leads";

export const Route = createFileRoute("/admin/leads")({
  loader: () => requireEditor(),
  component: LeadsPage,
});

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-300 border-blue-400/30",
  contacted: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  quoted: "bg-purple-500/15 text-purple-300 border-purple-400/30",
  converted: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  closed: "bg-zinc-500/15 text-zinc-300 border-zinc-400/30",
};

function LeadRow({
  lead,
  onOpen,
  onStatus,
}: {
  lead: any;
  onOpen: () => void;
  onStatus: (s: string) => void;
}) {
  return (
    <tr
      className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5"
      onClick={onOpen}
    >
      <td className="px-3 py-3">
        <p className="font-medium text-zinc-100">{lead.name}</p>
        <p className="text-xs text-zinc-500">
          {new Date(lead.created_at).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </td>
      <td className="hidden px-3 py-3 md:table-cell">
        <p className="flex items-center gap-1.5 text-sm text-zinc-300">
          <Phone className="h-3.5 w-3.5 text-zinc-500" /> {lead.phone}
        </p>
        {lead.source_page ? <p className="text-[11px] text-zinc-500">{lead.source_page}</p> : null}
      </td>
      <td className="hidden px-3 py-3 lg:table-cell">
        <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-300">
          {lead.service}
        </Badge>
      </td>
      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
        <Select value={lead.status} onValueChange={(v) => onStatus(v)}>
          <SelectTrigger className={`h-7 w-28 border text-xs ${STATUS_STYLES[lead.status]}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEAD_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-3 py-3 text-right">
        <p className="hidden text-xs text-zinc-500 sm:block">View</p>
      </td>
    </tr>
  );
}

function LeadsPage() {
  const user = Route.useLoaderData() as AdminUser;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [service, setService] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [savingDetail, setSavingDetail] = useState(false);

  const pageSize = 25;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const leads = useQuery(
    adminLeadsPageQuery({
      search: debounced,
      status,
      service: service === "all" ? "" : service,
      page,
    }),
  );
  const summary = useQuery(adminLeadsSummaryQuery);
  const services = useQuery(adminServicesQuery);
  const users = useQuery({
    ...adminUsersQuery,
    enabled: user.role === "admin",
  });

  const rows = leads.data?.rows ?? [];
  const openLead = rows.find((r: any) => r.id === openId) ?? null;

  useEffect(() => {
    if (openLead) {
      setNotes(openLead.internal_notes ?? "");
      setAssignTo(openLead.assigned_to ?? "");
    }
  }, [openLead?.id]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "leads-summary"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };

  const changeStatus = async (id: string, s: string) => {
    try {
      await adminUpdateLead({ data: { id, patch: { status: s } } });
      toast.success("Status updated");
      invalidate();
    } catch {
      toast.error("Could not update status");
    }
  };

  const saveDetail = async () => {
    setSavingDetail(true);
    try {
      await adminUpdateLead({
        data: {
          id: openId!,
          patch: {
            ...(notes.trim() ? { internal_notes: notes.trim() } : {}),
            ...(user.role === "admin" && assignTo
              ? { assigned_to: assignTo === "unassigned" ? null : assignTo }
              : {}),
          },
        },
      });
      toast.success("Saved");
      invalidate();
    } catch {
      toast.error("Could not save");
    } finally {
      setSavingDetail(false);
    }
  };

  const exportCsv = async () => {
    try {
      const res = await adminExportLeads({
        data: { search: debounced, status, service: service === "all" ? "" : service },
      });
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ark-finance-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not export");
    }
  };

  const filtered = rows;

  const total = leads.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <PageHeader
        title="Leads inbox"
        description="Every enquiry from the contact form and landing pages lands here. Update the status as you follow up."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            className="border-white/10 text-zinc-300 hover:text-zinc-100"
          >
            <Download className="mr-1.5 h-4 w-4" /> Export CSV
          </Button>
        }
      />

      {summary.data ? (
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge className="border-teal-400/30 bg-teal-500/15 text-teal-300">
            Total: {summary.data.total}
          </Badge>
          <Badge className="border-blue-400/30 bg-blue-500/15 text-blue-300">
            New this week: {summary.data.newThisWeek}
          </Badge>
          {LEAD_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(status === s ? "" : s)}
              className="transition-opacity hover:opacity-75"
            >
              <Badge
                variant="outline"
                className={`border ${STATUS_STYLES[s]} ${status === s ? "ring-2 ring-teal-400/40" : ""}`}
              >
                {s}: {summary.data.byStatus[s] ?? 0}
              </Badge>
            </button>
          ))}
        </div>
      ) : null}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone or service…"
            className="bg-white/5 pl-9 text-zinc-100"
          />
        </div>
        <Select
          value={service}
          onValueChange={(v) => {
            setService(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full bg-white/5 text-zinc-100 sm:w-52">
            <SelectValue placeholder="All services" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {services.data?.map((s: any) => (
              <SelectItem key={s.id} value={s.title}>
                {s.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {debounced || status || service ? (
        <p className="mb-3 text-xs text-zinc-500">
          Showing filtered results
          {debounced ? ` for “${debounced}”` : ""}
          {service && service !== "all" ? ` in ${service}` : ""}
          {status ? ` · status ${status}` : ""}{" "}
          <button
            className="text-teal-300 hover:underline"
            onClick={() => {
              setSearch("");
              setDebounced("");
              setStatus("");
              setService("");
              setPage(1);
            }}
          >
            Clear filters
          </button>
        </p>
      ) : null}

      {leads.isLoading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading leads…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 p-10 text-center text-sm text-zinc-500">
          No leads match right now.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-3 py-2.5 font-semibold">Client</th>
                <th className="hidden px-3 py-2.5 font-semibold md:table-cell">Contact</th>
                <th className="hidden px-3 py-2.5 font-semibold lg:table-cell">Service</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead: any) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  onOpen={() => {
                    setNotes(lead.internal_notes ?? "");
                    setAssignTo(lead.assigned_to ?? "");
                    setOpenId(lead.id);
                  }}
                  onStatus={(s) => changeStatus(lead.id, s)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <Drawer open={Boolean(openLead)} onOpenChange={(o) => !o && setOpenId(null)}>
        <DrawerContent className="bg-[#0f1729] text-zinc-100">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-lg">{openLead?.name}</DrawerTitle>
            <DrawerDescription className="text-zinc-400">
              Received {openLead ? new Date(openLead.created_at).toLocaleString("en-IN") : ""} ·{" "}
              {openLead?.service}
            </DrawerDescription>
          </DrawerHeader>
          {openLead ? (
            <div className="space-y-5 px-5 pb-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={`tel:${openLead.phone}`}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-200"
                >
                  <Phone className="h-4 w-4 text-teal-300" /> {openLead.phone}
                </a>
                <a
                  href={`mailto:${openLead.email}`}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-200"
                >
                  <Mail className="h-4 w-4 text-teal-300" /> {openLead.email}
                </a>
              </div>

              {openLead.message ? (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Message
                  </p>
                  <p className="whitespace-pre-line text-sm text-zinc-200">{openLead.message}</p>
                </div>
              ) : null}

              <div>
                <Label className="text-sm text-zinc-300">Status</Label>
                <Select
                  value={openLead.status}
                  onValueChange={(v) => {
                    changeStatus(openLead.id, v);
                  }}
                >
                  <SelectTrigger className="mt-1.5 bg-white/5 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {user.role === "admin" ? (
                <div>
                  <Label className="text-sm text-zinc-300">Assigned to</Label>
                  <Select value={assignTo} onValueChange={setAssignTo}>
                    <SelectTrigger className="mt-1.5 bg-white/5 text-zinc-100">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {(users.data ?? []).map((u: any) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name || u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              <div>
                <Label className="text-sm text-zinc-300">Internal notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Private notes for your team (not visible to the client)…"
                  className="mt-1.5 min-h-[100px] bg-white/5 text-zinc-100"
                />
              </div>

              <DrawerFooter className="px-0">
                <Button onClick={saveDetail} disabled={savingDetail}>
                  {savingDetail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save notes
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/10 text-zinc-300"
                    onClick={() => {
                      setNotes("");
                      setAssignTo("");
                    }}
                  >
                    Clear
                  </Button>
                  <ConfirmButton
                    title="Delete this lead?"
                    description="The client's enquiry will be removed permanently."
                    confirmLabel="Delete lead"
                    onConfirm={async () => {
                      await adminDeleteLead({ data: { id: openLead.id } });
                      toast.success("Lead deleted");
                      setOpenId(null);
                      invalidate();
                    }}
                    trigger={
                      <Button
                        variant="outline"
                        className="border-red-400/30 text-red-300 hover:text-red-200"
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                      </Button>
                    }
                  />
                </div>
              </DrawerFooter>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
