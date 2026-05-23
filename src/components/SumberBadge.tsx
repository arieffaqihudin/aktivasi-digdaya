import { cn } from "@/lib/utils";
import type { SumberPengajuan, SumberSuratTugas } from "@/data/mockData";

export function SumberPengajuanBadge({ sumber, className }: { sumber: SumberPengajuan; className?: string }) {
  const map: Record<SumberPengajuan, { label: string; cls: string }> = {
    PUBLIC:        { label: "Public Activation", cls: "bg-[oklch(0.94_0.06_150)] text-[oklch(0.36_0.10_152)]" },
    PW_DASHBOARD:  { label: "PW Dashboard",      cls: "bg-[oklch(0.93_0.06_240)] text-[oklch(0.34_0.10_240)]" },
    PC_DASHBOARD:  { label: "PC Dashboard",      cls: "bg-[oklch(0.95_0.025_160)] text-[oklch(0.34_0.04_160)]" },
  };
  const m = map[sumber];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium", m.cls, className)}>
      {m.label}
    </span>
  );
}

export function SumberSuratBadge({ sumber, className }: { sumber: SumberSuratTugas; className?: string }) {
  const isSistem = sumber === "DIGDAYA_PERSURATAN";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        isSistem
          ? "bg-[oklch(0.94_0.06_150)] text-[oklch(0.36_0.10_152)]"
          : "bg-[oklch(0.95_0.005_160)] text-[oklch(0.38_0.02_160)]",
        className,
      )}
    >
      {isSistem ? "Dari Sistem" : "Upload Manual"}
    </span>
  );
}
