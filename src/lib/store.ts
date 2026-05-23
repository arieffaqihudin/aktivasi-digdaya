import { useSyncExternalStore } from "react";
import {
  seedRegistrations,
  seedPeruriBatches,
  seedAudit,
  type Registration,
  type PeruriBatch,
  type AuditEntry,
  type Status,
} from "@/data/mockData";

export interface SLAConfig {
  defaultDays: number;
  greenMaxDays: number;
  yellowMaxDays: number;
  notifyEmails: string;
}

export interface NotifConfig {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
}

export interface User {
  email: string;
  name: string;
  role: "Reviewer" | "Super Admin";
}

interface State {
  registrations: Registration[];
  batches: PeruriBatch[];
  audit: AuditEntry[];
  sla: SLAConfig;
  notif: NotifConfig;
  user: User | null;
  nextTicketSeq: number;
}

const STORAGE_KEY = "digdaya-portal-state-v1";

function initial(): State {
  return {
    registrations: seedRegistrations,
    batches: seedPeruriBatches,
    audit: seedAudit,
    sla: { defaultDays: 3, greenMaxDays: 1, yellowMaxDays: 3, notifyEmails: "ops@digdaya.nu.id" },
    notif: { emailEnabled: true, whatsappEnabled: false },
    user: null,
    nextTicketSeq: 121,
  };
}

function load(): State {
  if (typeof window === "undefined") return initial();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial();
    const parsed = JSON.parse(raw);
    return { ...initial(), ...parsed };
  } catch {
    return initial();
  }
}

let state: State = load();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function setState(next: Partial<State> | ((s: State) => Partial<State>)) {
  const patch = typeof next === "function" ? next(state) : next;
  state = { ...state, ...patch };
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

export function getState() {
  return state;
}

function pushAudit(entry: Omit<AuditEntry, "id" | "timestamp">) {
  const a: AuditEntry = {
    id: "a" + Math.random().toString(36).slice(2, 10),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  setState((s) => ({ audit: [a, ...s.audit] }));
}

export const actions = {
  resetAll() {
    state = initial();
    persist();
    listeners.forEach((l) => l());
  },

  submitRegistration(data: Omit<Registration, "ticketId" | "status" | "submittedAt">): Registration {
    const seq = state.nextTicketSeq;
    const ticketId = `AKT-2026-${String(seq).padStart(6, "0")}`;
    const reg: Registration = {
      ...data,
      ticketId,
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };
    setState((s) => ({
      registrations: [reg, ...s.registrations],
      nextTicketSeq: s.nextTicketSeq + 1,
    }));
    pushAudit({
      actor: data.email,
      role: "Pengurus",
      action: "SUBMIT_REGISTRATION",
      ticketId,
      detail: `Pendaftaran baru dari ${data.namaKepengurusan}.`,
    });
    return reg;
  },

  approve(ticketId: string) {
    const user = state.user;
    setState((s) => ({
      registrations: s.registrations.map((r) =>
        r.ticketId === ticketId
          ? {
              ...r,
              status: "Approved" as Status,
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.email ?? "reviewer@digdaya.nu.id",
              includedInPeruriBatch: true,
              rejectReason: undefined,
            }
          : r,
      ),
    }));
    pushAudit({
      actor: user?.email ?? "reviewer@digdaya.nu.id",
      role: user?.role ?? "Reviewer",
      action: "APPROVE_REGISTRATION",
      ticketId,
      detail: `Pendaftaran ${ticketId} disetujui.`,
    });
  },

  reject(ticketId: string, reason: string) {
    const user = state.user;
    setState((s) => ({
      registrations: s.registrations.map((r) =>
        r.ticketId === ticketId
          ? {
              ...r,
              status: "Rejected" as Status,
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.email ?? "reviewer@digdaya.nu.id",
              rejectReason: reason,
              includedInPeruriBatch: false,
            }
          : r,
      ),
    }));
    pushAudit({
      actor: user?.email ?? "reviewer@digdaya.nu.id",
      role: user?.role ?? "Reviewer",
      action: "REJECT_REGISTRATION",
      ticketId,
      detail: `Pendaftaran ${ticketId} ditolak. Alasan: ${reason}`,
    });
  },

  generatePeruriBatch(): PeruriBatch | null {
    const eligible = state.registrations.filter(
      (r) => r.status === "Approved" && !r.peruriBatchId,
    );
    if (eligible.length === 0) return null;
    const seq = state.batches.length + 1;
    const id = `BATCH-2026-${String(seq).padStart(3, "0")}`;
    const batch: PeruriBatch = {
      id,
      date: new Date().toISOString().slice(0, 10),
      generatedAt: new Date().toISOString(),
      count: eligible.length,
      status: "Ready",
      ticketIds: eligible.map((r) => r.ticketId),
    };
    setState((s) => ({
      batches: [batch, ...s.batches],
      registrations: s.registrations.map((r) =>
        eligible.find((e) => e.ticketId === r.ticketId)
          ? { ...r, peruriBatchId: id, includedInPeruriBatch: true }
          : r,
      ),
    }));
    pushAudit({
      actor: state.user?.email ?? "system",
      role: state.user?.role ?? "System",
      action: "GENERATE_PERURI_BATCH",
      detail: `Batch ${id} dibuat dengan ${eligible.length} record.`,
    });
    return batch;
  },

  markBatchDownloaded(batchId: string) {
    const user = state.user;
    setState((s) => ({
      batches: s.batches.map((b) =>
        b.id === batchId
          ? { ...b, status: "Downloaded", downloadedBy: user?.email ?? "admin@digdaya.nu.id" }
          : b,
      ),
    }));
    pushAudit({
      actor: user?.email ?? "admin@digdaya.nu.id",
      role: user?.role ?? "Super Admin",
      action: "DOWNLOAD_PERURI_BATCH",
      detail: `Mengunduh batch ${batchId}.`,
    });
  },

  login(email: string, password: string): User | null {
    if (password !== "password") return null;
    let user: User | null = null;
    if (email === "reviewer@digdaya.nu.id") {
      user = { email, name: "Reviewer Digdaya", role: "Reviewer" };
    } else if (email === "admin@digdaya.nu.id") {
      user = { email, name: "Super Admin Digdaya", role: "Super Admin" };
    }
    if (user) setState({ user });
    return user;
  },

  logout() {
    setState({ user: null });
  },

  updateSLA(cfg: Partial<SLAConfig>) {
    setState((s) => ({ sla: { ...s.sla, ...cfg } }));
    pushAudit({
      actor: state.user?.email ?? "system",
      role: state.user?.role ?? "Super Admin",
      action: "UPDATE_SLA_SETTING",
      detail: `Konfigurasi SLA diperbarui.`,
    });
  },

  updateNotif(cfg: Partial<NotifConfig>) {
    setState((s) => ({ notif: { ...s.notif, ...cfg } }));
  },
};
