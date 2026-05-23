import { cn } from "@/lib/utils";
import type { Status } from "@/data/mockData";

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const map: Record<Status, { label: string; cls: string }> = {
    Pending:  { label: "Pending Review", cls: "bg-[oklch(0.95_0.02_220)] text-[oklch(0.40_0.05_220)]" },
    Approved: { label: "Disetujui",      cls: "bg-[oklch(0.94_0.06_150)] text-[oklch(0.36_0.10_152)]" },
    Rejected: { label: "Ditolak",        cls: "bg-[oklch(0.94_0.05_25)] text-[oklch(0.42_0.15_25)]" },
  };
  const m = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        m.cls,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {m.label}
    </span>
  );
}
