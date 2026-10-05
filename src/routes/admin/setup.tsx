import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminBootstrap } from "@/routes/api/-admin-auth";

export const Route = createFileRoute("/admin/setup")({
  component: SetupPage,
});

function SetupPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminBootstrap({ data: { setupToken: token } });
      toast.success("Admin created and signed in");
      await router.invalidate();
      await router.navigate({ to: "/admin" });
    } catch (err) {
      if (err instanceof Response) {
        const body = await err.json().catch(() => null);
        toast.error(body?.message ?? "Setup failed");
      } else {
        toast.error("Setup failed");
      }
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1120] px-4">
      <div className="w-full max-w-sm">
        <a href="/admin/login" className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </a>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-100">Create the first admin</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Enter the ADMIN_SETUP_TOKEN from your hosting environment. The first admin account will be
            created using the ADMIN_EMAIL and ADMIN_PASSWORD settings.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div>
            <Label htmlFor="token" className="text-sm text-zinc-300">
              Setup token
            </Label>
            <div className="relative mt-1.5">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="••••••••••••"
                required
                className="bg-white/5 pl-9 text-zinc-100"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create admin
          </Button>
        </form>
      </div>
    </div>
  );
}