import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  FileDown,
  Timer,
  ScrollText,
  Users,
  Settings,
  Database,
  LogOut,
  Menu,
  Search,
  Bell,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { actions, useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";

type MenuItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const reviewerMenu: MenuItem[] = [
  { to: "/dashboard/review", label: "Ringkasan", icon: LayoutDashboard },
  { to: "/dashboard/review/antrian", label: "Antrian Pendaftaran", icon: Inbox },
  { to: "/dashboard/peruri", label: "Export Peruri", icon: FileDown },
  { to: "/dashboard/sla", label: "SLA Monitoring", icon: Timer },
  { to: "/dashboard/audit-log", label: "Audit Log", icon: ScrollText },
];

const adminMenu: MenuItem[] = [
  { to: "/dashboard/admin", label: "Overview Nasional", icon: LayoutDashboard },
  { to: "/dashboard/review/antrian", label: "Manajemen Pendaftaran", icon: Inbox },
  { to: "/dashboard/peruri", label: "Export Peruri", icon: FileDown },
  { to: "/dashboard/admin/sla", label: "Konfigurasi SLA", icon: Settings },
  { to: "/dashboard/admin/notifikasi", label: "Konfigurasi Notifikasi", icon: Bell },
  { to: "/dashboard/admin/master", label: "Master Data Kepengurusan", icon: Database },
  { to: "/dashboard/audit-log", label: "Audit Log", icon: ScrollText },
  { to: "/dashboard/admin/users", label: "User Management", icon: Users },
];

export function DashboardLayout() {
  const user = useStore((s) => s.user);
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  if (!user) return null;
  const menu = user.role === "Super Admin" ? adminMenu : reviewerMenu;

  const Sidebar = (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center justify-between px-5 border-b border-sidebar-border">
        <Logo variant="light" />
        <button className="lg:hidden text-sidebar-foreground" onClick={() => setMobileOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          {user.role === "Super Admin" ? "Super Admin" : "Reviewer"}
        </p>
        <ul className="space-y-1">
          {menu.map((m) => {
            const active = path === m.to || (m.to !== "/dashboard/review" && m.to !== "/dashboard/admin" && path.startsWith(m.to));
            return (
              <li key={m.to}>
                <Link
                  to={m.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <m.icon className="h-4 w-4" />
                  {m.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-2 text-xs">
          <p className="font-medium text-sidebar-foreground">{user.name}</p>
          <p className="text-sidebar-foreground/60">{user.email}</p>
        </div>
        <button
          onClick={() => {
            actions.logout();
            navigate({ to: "/login" });
          }}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-sidebar-foreground/80 hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:block">{Sidebar}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10">{Sidebar}</div>
        </div>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari tiket, kepengurusan, atau admin…" className="h-9 w-80 pl-9" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Bell className="h-4 w-4" />
            </button>
            <div className="hidden text-right text-xs sm:block">
              <p className="font-medium text-foreground">{user.name}</p>
              <p className="text-muted-foreground">{user.role}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
