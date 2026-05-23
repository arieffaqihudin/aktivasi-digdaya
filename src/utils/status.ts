import type { Registration } from "@/data/mockData";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

export function daysSinceSubmit(reg: Registration): number {
  const submitted = new Date(reg.submittedAt).getTime();
  const end = reg.reviewedAt ? new Date(reg.reviewedAt).getTime() : Date.now();
  return Math.max(0, (end - submitted) / (1000 * 60 * 60 * 24));
}

export type SLABucket = "Aman" | "Mendekati" | "Lewat";

export function slaBucket(reg: Registration, greenMax = 1, yellowMax = 3): SLABucket {
  if (reg.status !== "Pending") {
    return daysSinceSubmit(reg) > yellowMax ? "Lewat" : "Aman";
  }
  const d = daysSinceSubmit(reg);
  if (d < greenMax) return "Aman";
  if (d <= yellowMax) return "Mendekati";
  return "Lewat";
}

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return dateTimeFormatter.format(new Date(iso));
}

export function formatRelativeDays(reg: Registration): string {
  const d = daysSinceSubmit(reg);
  if (d < 1) return "<1 hari";
  return `${Math.floor(d)} hari`;
}
