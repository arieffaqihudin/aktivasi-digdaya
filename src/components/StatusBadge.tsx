import { cn } from "@/lib/utils";
import type { Status } from "@/data/mockData";

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const map: Record<Status, { label: string; cls: string }> = {
    Pending: { label: "Menunggu Review", cls: "bg-warning/15 text-warning-foreground border border-warning/30" },
    Approved: { label: "Disetujui", cls: "bg-success/15 text-success border border-success/30" },
    Rejected: { label: "Ditolak", cls: "bg-destructive/10 text-destructive border border-destructive/30" },
  };
  const m = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        m.cls,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {m.label}
    </span>
  );
}
