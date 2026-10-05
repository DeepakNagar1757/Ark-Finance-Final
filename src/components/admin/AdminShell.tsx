import { useState } from "react";
import { Link, useRouter, useLocation, Outlet } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  BarChart3,
  ListOrdered,
  Users,
  MessageSquareQuote,
  FileText,
  Image,
  LayoutGrid,
  FileSearch,
  ScrollText,
  Settings,
  ShieldCheck,
  History,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Sparkles,
  MailPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { adminLogout } from "@/routes/api/-admin-auth";
import type { AdminUser } from "@/lib/admin/guard";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Leads",
    items: [
      { label: "Leads inbox", to: "/admin/leads", icon: Inbox },
      { label: "Subscribers", to: "/admin/subscribers", icon: MailPlus },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Services", to: "/admin/services", icon: Briefcase },
      { label: "Stats", to: "/admin/stats", icon: BarChart3 },
      { label: "Process steps", to: "/admin/process", icon: ListOrdered },
      { label: "Team", to: "/admin/team", icon: Users },
      { label: "Testimonials", to: "/admin/testimonials", icon: MessageSquareQuote },
    ],
  },
  {
    title: "Blog",
    items: [
      { label: "Posts", to: "/admin/posts", icon: FileText },
      { label: "Media library", to: "/admin/media", icon: Image },
    ],
  },
  {
    title: "Site",
    items: [
      { label: "Page editing", to: "/admin/pages", icon: LayoutGrid },
      { label: "SEO & meta", to: "/admin/seo", icon: FileSearch },
      { label: "Legal pages", to: "/admin/legal", icon: ScrollText },
      { label: "Site settings", to: "/admin/settings", icon: Settings },
    ],
  },
  {
    title: "Admin",
    items: [
      { label: "Users", to: "/admin/users", icon: ShieldCheck, adminOnly: true },
      { label: "Audit log", to: "/admin/audit", icon: History, adminOnly: true },
    ],
  },
];

function NavList({
  user,
  location,
  onNavigate,
}: {
  user: AdminUser;
  location: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-5 px-3 py-4" aria-label="Admin navigation">
      {GROUPS.map((group) => {
        const visible = group.items.filter((i) => !i.adminOnly || user.role === "admin");
        if (visible.length === 0) return null;
        return (
          <div key={group.title}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {visible.map((item) => {
                const active =
                  item.to === "/admin" ? location === "/admin" : location.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-teal-500/10 text-teal-300"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function AdminShell({ user }: { user: AdminUser | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const location = useLocation().pathname;

  const handleLogout = async () => {
    await adminLogout();
    queryClient.clear();
    toast.success("Signed out");
    await router.invalidate();
  };

  const initials = (user?.name || user?.email || "A")
    .split(" ")
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const brand = (
    <div className="flex items-center gap-2.5">
      <img src="/ark-logo.png" alt="ARK Finance" className="h-8 w-8 rounded-full object-cover" />
      <div className="leading-tight">
        <p className="text-sm font-bold text-zinc-100">ARK Finance</p>
        <p className="text-[11px] text-zinc-400">Admin panel</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b1120] text-zinc-100">
      <Toaster richColors position="top-center" />

      {/* Desktop sidebar */}
      {user && (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/10 bg-[#0b1120] lg:flex">
          <div className="flex h-16 items-center border-b border-white/10 px-4">{brand}</div>
          <div className="flex-1 overflow-y-auto">
            <NavList user={user} location={location} />
          </div>
        </aside>
      )}

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#0b1120]/90 px-4 backdrop-blur lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-[#0b1120] p-0 text-zinc-100">
            <div className="flex h-16 items-center border-b border-white/10 px-4">
              {brand}
              <SheetClose className="ml-auto text-zinc-400" />
            </div>
            {user && (
              <div className="max-h-[70vh] overflow-y-auto">
                <NavList user={user} location={location} onNavigate={() => setMobileOpen(false)} />
              </div>
            )}
          </SheetContent>
        </Sheet>
        {brand}
        <div className="w-9" />
      </header>

      {/* Main */}
      <div className="lg:pl-60">
        {user && (
          <header className="sticky top-0 z-30 hidden h-16 items-center justify-end gap-3 border-b border-white/10 bg-[#0b1120]/90 px-6 backdrop-blur lg:flex">
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View website
            </Link>
            <Separator orientation="vertical" className="h-5 bg-white/10" />
            <div className="flex items-center gap-2">
              {user.role === "admin" ? <Sparkles className="h-3.5 w-3.5 text-amber-400" /> : null}
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-teal-500/20 text-xs font-semibold text-teal-300">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <p className="text-sm font-medium text-zinc-100">{user.name || user.email}</p>
                <p className="text-[11px] capitalize text-zinc-400">{user.role}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="ml-2 text-zinc-400 hover:text-zinc-100"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
        )}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom logout */}
      {user && (
        <div className="fixed bottom-4 right-4 z-40 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
            className="border-white/10 bg-[#0b1120] text-zinc-300"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
