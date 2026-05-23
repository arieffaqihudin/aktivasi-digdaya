import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function PublicHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <Logo variant="header" />
        </Link>
        <Link
          to="/login"
          className="text-[12px] font-medium text-muted-foreground hover:text-primary"
        >
          Login Internal
        </Link>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-center px-4 sm:px-6">
        <p className="text-[12px] text-muted-foreground">
          Digdaya NU · Tim Digital PMO PBNU
        </p>
      </div>
    </footer>
  );
}
