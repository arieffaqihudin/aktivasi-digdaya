import { cn } from "@/lib/utils";
import type { Status } from "@/data/mockData";

const MAP: Record<Status, { label: string; cls: string }> = {
  Pending:        { label: "Pending Review",  cls: "bg-[oklch(0.95_0.02_220)] text-[oklch(0.40_0.05_220)]" },
  Approved:       { label: "Disetujui",       cls: "bg-[oklch(0.94_0.06_150)] text-[oklch(0.36_0.10_152)]" },
  PerluPerbaikan: { label: "Perlu Perbaikan", cls: "bg-[oklch(0.95_0.08_75)]  text-[oklch(0.42_0.13_60)]" },
  RejectedFinal:  { label: "Ditolak Final",   cls: "bg-[oklch(0.94_0.05_25)]  text-[oklch(0.42_0.15_25)]" },
};

export const STATUS_LABEL = (s: Status) => MAP[s].label;

export const STATUS_COPY: Record<Status, string> = {
  Pending: "Pengajuan sedang menunggu review Tim Digdaya PBNU.",
  Approved: "Pengajuan disetujui. Administrator dapat melanjutkan aktivasi akun Digdaya.",
  PerluPerbaikan:
    "Pengajuan perlu diperbaiki. Silakan cek catatan reviewer dan kirim ulang perbaikan.",
  RejectedFinal:
    "Pengajuan ditolak dan tidak dapat dilanjutkan. Silakan hubungi Tim Digdaya PBNU jika membutuhkan bantuan.",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const m = MAP[status];
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
