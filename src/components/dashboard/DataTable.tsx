import { cn } from "@/lib/utils";
import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

export function DataTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-4 my-4 overflow-hidden rounded-xl border border-border bg-card sm:mx-6 lg:mx-8", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-[13px]">{children}</table>
      </div>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-[oklch(0.975_0.005_220)] text-left">
      {children}
    </thead>
  );
}

export function TH({ children, className, ...rest }: ThHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <th
      className={cn(
        "px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground",
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

export function TR({ children, className, ...rest }: React.HTMLAttributes<HTMLTableRowElement> & { children?: ReactNode }) {
  return (
    <tr className={cn("border-t border-border hover:bg-[oklch(0.985_0.005_150)] transition-colors", className)} {...rest}>
      {children}
    </tr>
  );
}

export function TD({ children, className, ...rest }: TdHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <td className={cn("h-[68px] px-5 align-middle text-foreground", className)} {...rest}>
      {children}
    </td>
  );
}

export function RowAction({
  title,
  onClick,
  children,
  tone = "default",
}: {
  title: string;
  onClick?: () => void;
  children: ReactNode;
  tone?: "default" | "primary" | "danger";
}) {
  const cls =
    tone === "danger"
      ? "text-destructive hover:bg-destructive/10"
      : tone === "primary"
      ? "text-primary hover:bg-accent"
      : "text-muted-foreground hover:bg-secondary hover:text-foreground";
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn("inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors", cls)}
    >
      {children}
    </button>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children?: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-14 text-center text-sm text-muted-foreground">
        {children ?? "Tidak ada data."}
      </td>
    </tr>
  );
}
