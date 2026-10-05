import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, ShieldCheck, Trash2, KeyRound, User as UserIcon } from "lucide-react";
import { PageHeader, ConfirmButton } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { requireAdmin } from "@/lib/admin/guard";
import { adminUsersQuery } from "@/lib/admin/queries";
import {
  adminChangePassword,
  adminCreateUser,
  adminDeleteUser,
  adminToggleUser,
} from "@/routes/api/-admin-dashboard";
import { adminMe } from "@/routes/api/-admin-auth";

export const Route = createFileRoute("/admin/users")({
  loader: () => requireAdmin(),
  component: UsersPage,
});

function UsersPage() {
  const queryClient = useQueryClient();
  const users = useQuery(adminUsersQuery);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "editor", password: "" });
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState<{ id: string } | null>(null);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    adminMe().then((u) => u && setMe(u as { id: string }));
  }, []);

  const create = async () => {
    setSaving(true);
    try {
      await adminCreateUser({ data: form as never });
      toast.success("User created");
      setOpen(false);
      setForm({ email: "", name: "", role: "editor", password: "" });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (err) {
      if (err instanceof Response) {
        const body = await err.json().catch(() => null);
        toast.error(body?.message ?? "Could not create user");
      } else {
        toast.error("Could not create user");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id: string, is_active: boolean) => {
    try {
      await adminToggleUser({ data: { id, is_active } });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (err) {
      if (err instanceof Response) {
        const body = await err.json().catch(() => null);
        toast.error(body?.message ?? "Could not update user");
      } else {
        toast.error("Could not update user");
      }
    }
  };

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    setPwSaving(true);
    try {
      await adminChangePassword({
        data: { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
      });
      toast.success("Password updated");
      setPwOpen(false);
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      if (err instanceof Response) {
        const body = await err.json().catch(() => null);
        toast.error(body?.message ?? "Could not change password");
      } else {
        toast.error("Could not change password");
      }
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Admin users"
        description="Who can sign in to this panel. Admins can change everything; editors can manage content and leads."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setPwOpen(true)}>
              <KeyRound className="mr-1 h-4 w-4" /> Change my password
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Invite user
            </Button>
          </div>
        }
      />

      {users.isLoading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-2">
          {(users.data ?? []).map((u: any) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/15">
                {u.role === "admin" ? (
                  <ShieldCheck className="h-4 w-4 text-amber-300" />
                ) : (
                  <UserIcon className="h-4 w-4 text-teal-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-100">
                  {u.name || u.email}
                  {me && me.id === u.id ? (
                    <span className="ml-2 text-[11px] text-zinc-500">(you)</span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-zinc-500">{u.email}</p>
              </div>
              <Badge
                className={`border ${u.role === "admin" ? "border-amber-400/30 bg-amber-500/15 text-amber-300" : "border-teal-400/30 bg-teal-500/15 text-teal-300"}`}
              >
                {u.role}
              </Badge>
              {me && me.id !== u.id ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-400">Active</span>
                  <Switch
                    checked={u.is_active !== false}
                    onCheckedChange={(v) => toggle(u.id, v)}
                  />
                </div>
              ) : null}
              {me && me.id !== u.id ? (
                <ConfirmButton
                  title="Delete this user?"
                  description="They will lose access to the admin panel immediately."
                  confirmLabel="Delete user"
                  onConfirm={async () => {
                    try {
                      await adminDeleteUser({ data: { id: u.id } });
                      toast.success("User deleted");
                      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
                    } catch (err) {
                      if (err instanceof Response) {
                        const body = await err.json().catch(() => null);
                        toast.error(body?.message ?? "Could not delete user");
                      } else {
                        toast.error("Could not delete user");
                      }
                    }
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
              ) : null}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#0f1729] text-zinc-100">
          <DialogHeader>
            <DialogTitle>Create a user</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Editors can manage content and leads but not settings, users or the audit log.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-zinc-300">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 bg-white/5 text-zinc-100"
                placeholder="consultant@arkfinance.in"
              />
            </div>
            <div>
              <Label className="text-sm text-zinc-300">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 bg-white/5 text-zinc-100"
                placeholder="Rakesh Sharma"
              />
            </div>
            <div>
              <Label className="text-sm text-zinc-300">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className="mt-1.5 bg-white/5 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-zinc-300">Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1.5 bg-white/5 text-zinc-100"
                placeholder="At least 8 characters"
                minLength={8}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={create}
              disabled={saving || form.email.length < 5 || form.password.length < 8}
            >
              {saving ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-1 h-4 w-4" />
              )}
              Create user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="bg-[#0f1729] text-zinc-100">
          <DialogHeader>
            <DialogTitle>Change your password</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Use a strong password of at least 8 characters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-zinc-300">Current password</Label>
              <Input
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                className="mt-1.5 bg-white/5 text-zinc-100"
                minLength={8}
              />
            </div>
            <div>
              <Label className="text-sm text-zinc-300">New password</Label>
              <Input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                className="mt-1.5 bg-white/5 text-zinc-100"
                minLength={8}
              />
            </div>
            <div>
              <Label className="text-sm text-zinc-300">Confirm new password</Label>
              <Input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                className="mt-1.5 bg-white/5 text-zinc-100"
                minLength={8}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={changePassword}
              disabled={
                pwSaving ||
                pwForm.currentPassword.length < 8 ||
                pwForm.newPassword.length < 8 ||
                pwForm.newPassword !== pwForm.confirm
              }
            >
              {pwSaving ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="mr-1 h-4 w-4" />
              )}
              Update password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
