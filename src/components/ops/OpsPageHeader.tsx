import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import type { ReactNode } from "react";

export type Crumb = { label: string; to?: string };

/** Page header tuned for Digdaya Ops modules — simple breadcrumb + title on white card-ish surface. */
export function OpsPageHeader({
  title,
  subtitle,
  breadcrumb,
  action,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: Crumb[];
  action?: ReactNode;
}) {
  return (
    <div className="px-4 pt-5 sm:px-6 lg:px-8">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="mb-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Link to="/ops" className="inline-flex items-center hover:text-primary">
            <Home className="h-3.5 w-3.5" />
          </Link>
          {breadcrumb.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 opacity-60" />
              {c.to ? (
                <Link to={c.to} className="hover:text-primary">{c.label}</Link>
              ) : (
                <span className={i === breadcrumb.length - 1 ? "text-foreground font-medium" : ""}>{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-1 text-[13px] text-muted-foreground max-w-2xl">{subtitle}</p>}
        </div>
        {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
      </div>
    </div>
  );
}

/** Ops white "big card" container, used everywhere inside Ops pages. */
export function OpsCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={"rounded-xl border border-border bg-card p-5 sm:p-6 " + className}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 text-[12.5px] text-muted-foreground">{description}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Page body wrapper — soft grey canvas + comfy spacing. */
export function OpsPageBody({ children }: { children: ReactNode }) {
  return <div className="space-y-5 p-4 sm:p-6 lg:p-8">{children}</div>;
}
