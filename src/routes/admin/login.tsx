import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/routes/api/-admin-auth";

export const Route = createFileRoute("/admin/login")({
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminLogin({ data: { email, password } });
      await router.invalidate();
      await router.navigate({ to: "/admin" });
    } catch (err) {
      if (err instanceof Response) {
        const body = await err.json().catch(() => null);
        toast.error(body?.message ?? "Login failed");
      } else {
        toast.error("Login failed");
      }
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1120] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src="/ark-logo.png" alt="ARK Finance" className="mb-3 h-14 w-14 rounded-full object-cover" />
          <h1 className="text-xl font-bold text-zinc-100">ARK Finance Admin</h1>
          <p className="mt-1 text-sm text-zinc-400">Sign in to manage your website</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div>
            <Label htmlFor="email" className="text-sm text-zinc-300">
              Email
            </Label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="karan@arkfinance.in"
                required
                className="bg-white/5 pl-9 text-zinc-100"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="password" className="text-sm text-zinc-300">
              Password
            </Label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white/5 pl-9 text-zinc-100"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-zinc-500">
          First time? <a href="/admin/setup" className="text-zinc-300 underline underline-offset-2">Create the first admin</a>.
        </p>
      </div>
    </div>
  );
}