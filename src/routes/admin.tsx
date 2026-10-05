import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminMe } from "@/routes/api/-admin-auth";

export const Route = createFileRoute("/admin")({
  loader: async () => ({ user: await adminMe() }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = Route.useLoaderData();
  return <AdminShell user={user} />;
}