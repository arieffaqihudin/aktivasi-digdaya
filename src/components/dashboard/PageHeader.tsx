import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import type { ReactNode } from "react";

export type Crumb = { label: string; to?: string };

export function PageHeader({
  title,
  subtitle,
  count,
  breadcrumb,
  action,
}: {
  title: string;
  subtitle?: string;
  count?: number | string;
  breadcrumb?: Crumb[];
  action?: ReactNode;
}) {
  return (
    <div className="border-b border-border bg-card px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="mb-2 hidden sm:flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Home className="h-3.5 w-3.5" />
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
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h1 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-foreground">{title}</h1>
            {count !== undefined && (
              <span className="text-[12px] sm:text-[13px] font-medium text-muted-foreground">(Total {count})</span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-[12px] sm:text-[13px] text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
      </div>
    </div>
  );
}

/** Control row: page size + range info + right CTAs */
export function ListControls({
  pageSize,
  onPageSize,
  rangeText,
  right,
}: {
  pageSize?: number;
  onPageSize?: (n: number) => void;
  rangeText?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8">
      <div className="flex flex-wrap items-center gap-3 text-[12px] sm:text-[13px] text-muted-foreground">
        {pageSize !== undefined && onPageSize && (
          <label className="flex items-center gap-2">
            <span className="hidden sm:inline">Tampilkan</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSize(Number(e.target.value))}
              className="h-9 rounded-md border border-border bg-card px-2 text-[13px] text-foreground outline-none focus:border-primary"
            >
              {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="hidden sm:inline">data</span>
          </label>
        )}
        {rangeText && <span className="text-muted-foreground">{rangeText}</span>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

/** Horizontal filter row */
export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-3 pt-4 sm:px-6 lg:px-8 [&>*]:min-w-0 [&>*]:flex-1 sm:[&>*]:flex-none">
      {children}
    </div>
  );
}
