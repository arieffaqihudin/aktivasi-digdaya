import { cn } from "@/lib/utils";
import type { SLABucket } from "@/utils/status";

export function SLABadge({ bucket, className }: { bucket: SLABucket; className?: string }) {
  const map: Record<SLABucket, { label: string; cls: string }> = {
    Aman:      { label: "Aman",         cls: "bg-[oklch(0.94_0.06_150)] text-[oklch(0.36_0.10_152)]" },
    Mendekati: { label: "Mendekati",    cls: "bg-[oklch(0.95_0.08_85)] text-[oklch(0.42_0.08_80)]" },
    Lewat:     { label: "Lewat SLA",    cls: "bg-[oklch(0.94_0.05_25)] text-[oklch(0.42_0.15_25)]" },
  };
  const m = map[bucket];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        m.cls,
        className,
      )}
    >
      {m.label}
    </span>
  );
}
