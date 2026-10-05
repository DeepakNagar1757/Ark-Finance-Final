import { redirect } from "@tanstack/react-router";
import { adminMe } from "@/routes/api/-admin-auth";

export type AdminUser = { id: string; email: string; name: string; role: "admin" | "editor" };

export async function requireEditor(): Promise<AdminUser> {
  const user = await adminMe();
  if (!user) throw redirect({ to: "/admin/login", replace: true });
  return user as AdminUser;
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await requireEditor();
  if (user.role !== "admin") throw redirect({ to: "/admin", replace: true });
  return user;
}