import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const links = [
    { to: "/", label: "Beranda" },
    { to: "/daftar", label: "Daftar Administrator" },
    { to: "/cek-status", label: "Cek Status" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/"><Logo /></Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition",
                path === l.to ? "bg-secondary text-primary-dark" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/login" className="ml-2">
            <Button variant="outline" size="sm">Login Internal</Button>
          </Link>
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className={cn("rounded-md px-3 py-2 text-sm font-medium", path === l.to ? "bg-secondary text-primary-dark" : "text-foreground")}>
                {l.label}
              </Link>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-primary-dark">
              Login Internal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center">
        <div>
          <Logo />
          <p className="mt-2 max-w-md text-xs text-muted-foreground">
            Portal self-service onboarding administrator Digdaya untuk kepengurusan Nahdlatul Ulama.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Tim Digdaya PBNU. Untuk keperluan internal.</p>
      </div>
    </footer>
  );
}
