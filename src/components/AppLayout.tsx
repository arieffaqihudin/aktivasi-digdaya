import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Menu, X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { actions, useStore, type Role } from "@/lib/store";
import { NotificationBell } from "./NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const storeUser = useStore((s) => s.user);
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Synchronous auto-login fallback so the layout never gets stuck on an
  // infinite "Memuat dashboard…" screen on direct navigation.
  if (!storeUser) {
    const fallbackRole = allowedRoles[0];
    if (fallbackRole === "PW") actions.loginAs("pw@digdaya.nu.id");
    else if (fallbackRole === "PC") actions.loginAs("pc.kraksaan@digdaya.nu.id");
    else if (fallbackRole === "Super Admin") actions.loginAs("admin@digdaya.nu.id");
    else if (fallbackRole === "Reviewer") actions.loginAs("reviewer@digdaya.nu.id");
  }

  // Fallback user object so render proceeds immediately even before the
  // synchronous loginAs above has propagated through the store.
  const user = storeUser ?? {
    email: "admin@digdaya.nu.id",
    name: "Super Admin Digdaya",
    role: (allowedRoles[0] ?? "Super Admin") as Role,
    pcId: undefined as string | undefined,
    pcName: undefined as string | undefined,
    pwId: undefined as string | undefined,
    pwName: undefined as string | undefined,
  };

  useEffect(() => {
    if (storeUser && !allowedRoles.includes(storeUser.role)) {
      if (storeUser.role === "Super Admin") navigate({ to: "/ops/activation" });
      else if (storeUser.role === "Reviewer") navigate({ to: "/review" });
      else if (storeUser.role === "PW") navigate({ to: "/pw" });
      else navigate({ to: "/pc" });
    }
  }, [storeUser, navigate, allowedRoles]);

  useEffect(() => { setMobileOpen(false); }, [path]);

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
      <div className={cn("flex h-[60px] sm:h-[68px] lg:h-[76px] shrink-0 items-center border-b border-sidebar-border", collapsed ? "justify-center px-2" : "justify-between px-5")}>
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
    </aside>
  );

  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const roleSuffix = user.pcName ? ` · ${user.pcName.replace("PCNU ", "")}` : user.pwName ? ` · ${user.pwName.replace("PWNU ", "")}` : "";
  const handleLogout = () => {
    actions.logout();
    toast.success("Anda telah keluar.");
    navigate({ to: "/" });
  };

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
        <header className="flex h-[60px] sm:h-[68px] lg:h-[76px] shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-7 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button className="lg:hidden -ml-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary" onClick={() => setMobileOpen(true)} aria-label="Buka menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="hidden sm:block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Portal Aktivasi Digdaya</p>
              <h2 className="truncate text-[14px] sm:text-[17px] font-semibold text-foreground leading-tight max-w-[55vw] sm:max-w-none">{displayOrg}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />
            <div className="hidden h-9 w-px bg-border sm:block" />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 pr-2 outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/40 sm:gap-3">
                <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-accent text-[12px] sm:text-sm font-semibold text-primary-dark ring-1 ring-primary/15">
                  {initials}
                </span>
                <span className="hidden text-right sm:block">
                  <span className="block text-[13px] font-semibold text-foreground leading-tight">{user.name}</span>
                  <span className="block text-[11px] text-muted-foreground">{user.role}{roleSuffix}</span>
                </span>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-[240px] rounded-2xl border-border/70 p-2 shadow-lg">
                <DropdownMenuLabel className="px-2 py-2">
                  <p className="text-[13px] font-semibold text-foreground leading-tight">{user.name}</p>
                  {user.email && <p className="mt-0.5 truncate text-[11px] font-normal text-muted-foreground">{user.email}</p>}
                  <p className="mt-1 text-[11px] font-medium text-primary">{user.role}{roleSuffix}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={handleLogout}
                  className="cursor-pointer rounded-lg px-2 py-2 text-[13px] font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
