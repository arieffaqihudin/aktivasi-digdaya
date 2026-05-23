import { cn } from "@/lib/utils";
import type { SLABucket } from "@/utils/status";

export function SLABadge({ bucket, className }: { bucket: SLABucket; className?: string }) {
  const map: Record<SLABucket, { label: string; cls: string }> = {
    Aman: { label: "Aman", cls: "bg-success/15 text-success border-success/30" },
    Mendekati: { label: "Mendekati", cls: "bg-warning/20 text-warning-foreground border-warning/40" },
    Lewat: { label: "Lewat SLA", cls: "bg-destructive/10 text-destructive border-destructive/30" },
  };
  const m = map[bucket];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        m.cls,
        className,
      )}
    >
      {m.label}
    </span>
  );
}
