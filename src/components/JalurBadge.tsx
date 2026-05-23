import { cn } from "@/lib/utils";
import type { Jalur, AccessCodeStatus } from "@/data/mockData";

export function JalurBadge({ jalur, className }: { jalur: Jalur; className?: string }) {
  const isA = jalur === "A";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        isA
          ? "bg-[oklch(0.94_0.06_150)] text-[oklch(0.36_0.10_152)]"
          : "bg-[oklch(0.95_0.025_160)] text-[oklch(0.34_0.04_160)]",
        className,
      )}
    >
      Jalur {jalur}
    </span>
  );
}

export function AccessCodeStatusBadge({ status }: { status: AccessCodeStatus }) {
  const map: Record<AccessCodeStatus, { label: string; cls: string }> = {
    Unused:   { label: "Belum Digunakan", cls: "bg-[oklch(0.95_0.005_160)] text-[oklch(0.38_0.02_160)]" },
    Used:     { label: "Sudah Digunakan", cls: "bg-[oklch(0.94_0.06_150)] text-[oklch(0.36_0.10_152)]" },
    Expired:  { label: "Kedaluwarsa",     cls: "bg-[oklch(0.95_0.08_85)] text-[oklch(0.42_0.08_80)]" },
    Disabled: { label: "Dinonaktifkan",   cls: "bg-[oklch(0.90_0.005_160)] text-[oklch(0.35_0.02_160)]" },
  };
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium", m.cls)}>
      {m.label}
    </span>
  );
}
