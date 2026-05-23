import { cn } from "@/lib/utils";
import type { Jalur, AccessCodeStatus } from "@/data/mockData";

export function JalurBadge({ jalur, className }: { jalur: Jalur; className?: string }) {
  const isA = jalur === "A";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
        isA
          ? "border-primary/30 bg-primary/10 text-primary-dark"
          : "border-info/40 bg-info/10 text-info",
        className,
      )}
    >
      Jalur {jalur}
    </span>
  );
}

export function AccessCodeStatusBadge({ status }: { status: AccessCodeStatus }) {
  const map: Record<AccessCodeStatus, { label: string; cls: string }> = {
    Unused:   { label: "Belum Digunakan", cls: "bg-info/15 text-info border-info/30" },
    Used:     { label: "Sudah Digunakan", cls: "bg-success/15 text-success border-success/30" },
    Expired:  { label: "Kedaluwarsa",     cls: "bg-muted text-muted-foreground border-border" },
    Disabled: { label: "Dinonaktifkan",   cls: "bg-destructive/10 text-destructive border-destructive/30" },
  };
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium", m.cls)}>
      {m.label}
    </span>
  );
}
