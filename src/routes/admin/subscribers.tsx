import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Search, Trash2, MailCheck, MailX } from "lucide-react";
import { PageHeader, ConfirmButton } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requireEditor } from "@/lib/admin/guard";
import { adminSubscribersQuery } from "@/lib/admin/queries";
import { adminDeleteSubscriber, adminUpdateSubscriber } from "@/routes/api/-admin-dashboard";

export const Route = createFileRoute("/admin/subscribers")({
  loader: () => requireEditor(),
  component: SubscribersPage,
});

function SubscribersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const subscribers = useQuery(adminSubscribersQuery(page, debounced, status));
  const rows = subscribers.data?.rows ?? [];
  const total = subscribers.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "subscribers"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };

  const setStatusFor = async (id: string, next: "active" | "unsubscribed") => {
    try {
      await adminUpdateSubscriber({ data: { id, status: next } });
      toast.success(next === "active" ? "Subscriber reactivated" : "Marked unsubscribed");
      invalidate();
    } catch {
      toast.error("Could not update subscriber");
    }
  };

  return (
    <div>
      <PageHeader
        title="Newsletter subscribers"
        description="Everyone who signed up for updates from the website footer form."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or source…"
            className="pl-9 bg-white/5 text-zinc-100"
          />
        </div>
        <Select
          value={status || "all"}
          onValueChange={(v) => {
            setStatus(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full bg-white/5 text-zinc-100 sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {subscribers.isLoading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 p-10 text-center text-sm text-zinc-500">
          No subscribers found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="hidden px-4 py-3 sm:table-cell">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="hidden px-4 py-3 md:table-cell">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any) => (
                <tr key={row.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-zinc-100">{row.email}</td>
                  <td className="hidden px-4 py-3 text-zinc-400 sm:table-cell">
                    {row.source || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        row.status === "unsubscribed"
                          ? "border-zinc-400/30 bg-zinc-500/15 text-zinc-300"
                          : "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                      }
                    >
                      {row.status || "active"}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-zinc-500 md:table-cell">
                    {row.created_at ? new Date(row.created_at).toLocaleString("en-IN") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {row.status === "unsubscribed" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-300"
                          title="Reactivate"
                          onClick={() => setStatusFor(row.id, "active")}
                        >
                          <MailCheck className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400"
                          title="Mark unsubscribed"
                          onClick={() => setStatusFor(row.id, "unsubscribed")}
                        >
                          <MailX className="h-4 w-4" />
                        </Button>
                      )}
                      <ConfirmButton
                        title="Delete this subscriber?"
                        description="They will be removed from the mailing list permanently."
                        confirmLabel="Delete"
                        onConfirm={async () => {
                          await adminDeleteSubscriber({ data: { id: row.id } });
                          toast.success("Subscriber deleted");
                          invalidate();
                        }}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-300/80 hover:text-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </td>
                </tr>
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
    </div>
  );
}
