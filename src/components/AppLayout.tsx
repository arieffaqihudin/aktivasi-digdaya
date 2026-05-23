import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Menu, Bell, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { actions, useStore, type Role } from "@/lib/store";

export type MenuItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  section?: string;
};

export function AppLayout({
  menu,
  allowedRoles,
  scopeLabel,
  orgName,
}: {
  menu: MenuItem[];
  allowedRoles: Role[];
  scopeLabel: string;
  orgName?: string;
}) {
  const user = useStore((s) => s.user);
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!user) {
      const fallbackRole = allowedRoles[0];
      if (fallbackRole === "PW") actions.loginAs("pw@digdaya.nu.id");
      else if (fallbackRole === "PC") actions.loginAs("pc.kraksaan@digdaya.nu.id");
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      if (user.role === "Super Admin") navigate({ to: "/ops/activation" });
      else if (user.role === "Reviewer") navigate({ to: "/review" });
      else if (user.role === "PW") navigate({ to: "/pw" });
      else navigate({ to: "/pc" });
    }
  }, [user, navigate, allowedRoles]);

  useEffect(() => { setMobileOpen(false); }, [path]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Memuat dashboard…</p>
      </div>
    );
  }

  const displayOrg = orgName ?? user.pcName ?? user.pwName ?? "Pengurus Besar Nahdlatul Ulama";

  // Group menu by section
  const grouped: { section?: string; items: MenuItem[] }[] = [];
  for (const m of menu) {
    const last = grouped[grouped.length - 1];
    if (last && last.section === m.section) last.items.push(m);
    else grouped.push({ section: m.section, items: [m] });
  }

  const Sidebar = (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      <div className={cn("flex h-14 sm:h-16 lg:h-[84px] shrink-0 items-center border-b border-sidebar-border", collapsed ? "justify-center px-2" : "justify-between px-5")}>
        <Logo variant={collapsed ? "sidebar-collapsed" : "sidebar"} />
        <button
          className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground"
          onClick={() => setMobileOpen(false)}
          aria-label="Tutup menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="scrollbar-thin flex-1 overflow-y-auto py-4 px-3">
        {grouped.map((g, gi) => (
          <div key={gi} className={cn(gi > 0 && "mt-5")}>
            {!collapsed && g.section && (
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                {g.section}
              </p>
            )}
            <ul className="space-y-0.5">
              {g.items.map((m) => {
                const active = m.exact ? path === m.to : (path === m.to || path.startsWith(m.to + "/"));
                return (
                  <li key={m.to}>
                    <Link
                      to={m.to}
                      title={collapsed ? m.label : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        collapsed && "justify-center px-2",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      {active && !collapsed && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-primary" />
                      )}
                      <m.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-primary" : "text-sidebar-foreground/55 group-hover:text-primary")} />
                      {!collapsed && <span className="truncate">{m.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => { actions.logout(); navigate({ to: "/login" }); }}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "justify-center",
          )}
        >
          <LogOut className="h-4 w-4" /> {!collapsed && "Keluar"}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-dvh bg-background">
      <div className="hidden lg:block relative">
        {Sidebar}
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label="Toggle sidebar"
          className="absolute -right-3 top-24 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-card text-muted-foreground shadow-sm hover:text-primary lg:flex"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 max-w-[85vw]">{Sidebar}</div>
        </div>
      )}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <header className="flex h-14 sm:h-16 lg:h-[84px] shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button className="lg:hidden -ml-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary" onClick={() => setMobileOpen(true)} aria-label="Buka menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="hidden sm:block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Portal Aktivasi Digdaya</p>
              <h2 className="truncate text-[14px] sm:text-[17px] font-semibold text-foreground leading-tight max-w-[55vw] sm:max-w-none">{displayOrg}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Notifikasi">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
            </button>
            <div className="hidden h-9 w-px bg-border sm:block" />
            <div className="hidden text-right sm:block">
              <p className="text-[13px] font-semibold text-foreground leading-tight">{user.name}</p>
              <p className="text-[11px] text-muted-foreground">{user.role}{user.pcName ? ` · ${user.pcName.replace("PCNU ", "")}` : user.pwName ? ` · ${user.pwName.replace("PWNU ", "")}` : ""}</p>
            </div>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-accent text-[12px] sm:text-sm font-semibold text-primary-dark ring-1 ring-primary/15">
              {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
