import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { HelpCircle, ClipboardList } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="relative z-10 border-b border-border/60 bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1080px] items-center justify-between px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <Logo variant="header" />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/cek-status"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cek Status</span>
          </Link>
          <a
            href="mailto:digdaya@nu.or.id"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Bantuan</span>
          </a>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="relative z-10 border-t border-border/60 bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-[1080px] items-center justify-between px-4 sm:px-6">
        <p className="text-[12px] text-muted-foreground">
          Digdaya NU · Tim Digital PMO PBNU
        </p>
        <p className="text-[12px] text-muted-foreground/70 hidden sm:block">
          Portal Aktivasi Resmi
        </p>
      </div>
    </footer>
  );
}
