import { useSyncExternalStore } from "react";
import {
  seedRegistrations,
  seedPeruriBatches,
  seedAudit,
  seedAccessCodes,
  masterPC,
  demoPcUserPcId,
  type Registration,
  type PeruriBatch,
  type AuditEntry,
  type AccessCode,
  type AccessCodeStatus,
  type Status,
  type Jalur,
  type TipeOrg,
} from "@/data/mockData";

export interface SLAConfig {
  defaultDays: number;
  greenMaxDays: number;
  yellowMaxDays: number;
  notifyEmails: string;
  defaultCodeValidDays: number;
}
export interface NotifConfig {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
}
export type Role = "Super Admin" | "Reviewer" | "PC";
export interface User {
  email: string;
  name: string;
  role: Role;
  pcId?: string;
  pcName?: string;
}

interface State {
  registrations: Registration[];
  batches: PeruriBatch[];
  audit: AuditEntry[];
  accessCodes: AccessCode[];
  sla: SLAConfig;
  notif: NotifConfig;
  user: User | null;
  nextTicketSeq: number;
}

const STORAGE_KEY = "digdaya-portal-state-v2";

function initial(): State {
  return {
    registrations: seedRegistrations,
    batches: seedPeruriBatches,
    audit: seedAudit,
    accessCodes: seedAccessCodes,
    sla: { defaultDays: 3, greenMaxDays: 1, yellowMaxDays: 3, notifyEmails: "ops@digdaya.nu.id", defaultCodeValidDays: 30 },
    notif: { emailEnabled: true, whatsappEnabled: false },
    user: null,
    nextTicketSeq: 200,
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
  } catch { /* ignore */ }
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
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}
export function getState() { return state; }

function pushAudit(entry: Omit<AuditEntry, "id" | "timestamp">) {
  const a: AuditEntry = {
    id: "a" + Math.random().toString(36).slice(2, 10),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  setState((s) => ({ audit: [a, ...s.audit] }));
}

function newTicket(): { ticketId: string } {
  const seq = state.nextTicketSeq;
  const ticketId = `AKT-2026-${String(seq).padStart(6, "0")}`;
  setState({ nextTicketSeq: seq + 1 });
  return { ticketId };
}

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `DGD-${part(4)}-${part(4)}`;
}

export type VerifyResult =
  | { ok: true; code: AccessCode }
  | { ok: false; reason: "notfound" | "expired" | "used" | "disabled" };

export const actions = {
  resetAll() {
    state = initial();
    persist();
    listeners.forEach((l) => l());
  },

  // ===== Access codes =====
  verifyAccessCode(input: string): VerifyResult {
    const code = state.accessCodes.find((c) => c.code.toUpperCase() === input.trim().toUpperCase());
    if (!code) return { ok: false, reason: "notfound" };
    if (code.status === "Disabled") return { ok: false, reason: "disabled" };
    if (code.status === "Used") return { ok: false, reason: "used" };
    if (code.status === "Expired" || new Date(code.expiredAt).getTime() < Date.now()) return { ok: false, reason: "expired" };
    pushAudit({
      actor: "publik",
      role: "Publik",
      action: "VERIFY_ACCESS_CODE",
      detail: `Verifikasi kode ${code.code} berhasil untuk ${code.pcName}.`,
    });
    return { ok: true, code };
  },

  generateAccessCodes(pcIds: string[], validDays: number): AccessCode[] {
    const created: AccessCode[] = [];
    const now = new Date();
    const exp = new Date(now.getTime() + validDays * 86400000).toISOString();
    setState((s) => {
      let codes = [...s.accessCodes];
      for (const pcId of pcIds) {
        const pc = masterPC.find((p) => p.id === pcId);
        if (!pc) continue;
        // Disable kode unused lama
        codes = codes.map((c) =>
          c.pcId === pcId && c.status === "Unused" ? { ...c, status: "Disabled" as AccessCodeStatus } : c,
        );
        const code: AccessCode = {
          code: randomCode(),
          pcId,
          pcName: pc.nama,
          pw: pc.pw,
          status: "Unused",
          generatedAt: now.toISOString(),
          expiredAt: exp,
        };
        codes = [code, ...codes];
        created.push(code);
      }
      return { accessCodes: codes };
    });
    pushAudit({
      actor: state.user?.email ?? "system",
      role: state.user?.role ?? "Super Admin",
      action: "GENERATE_ACCESS_CODE",
      detail: `Generate ${created.length} kode akses (berlaku ${validDays} hari).`,
    });
    return created;
  },

  disableAccessCode(code: string) {
    setState((s) => ({
      accessCodes: s.accessCodes.map((c) =>
        c.code === code ? { ...c, status: "Disabled" as AccessCodeStatus } : c,
      ),
    }));
    pushAudit({
      actor: state.user?.email ?? "admin@digdaya.nu.id",
      role: state.user?.role ?? "Super Admin",
      action: "DISABLE_ACCESS_CODE",
      detail: `Menonaktifkan kode ${code}.`,
    });
  },

  regenerateAccessCode(pcId: string): AccessCode | null {
    const pc = masterPC.find((p) => p.id === pcId);
    if (!pc) return null;
    const validDays = state.sla.defaultCodeValidDays;
    const now = new Date();
    const newC: AccessCode = {
      code: randomCode(),
      pcId,
      pcName: pc.nama,
      pw: pc.pw,
      status: "Unused",
      generatedAt: now.toISOString(),
      expiredAt: new Date(now.getTime() + validDays * 86400000).toISOString(),
    };
    setState((s) => ({
      accessCodes: [
        newC,
        ...s.accessCodes.map((c) =>
          c.pcId === pcId && c.status === "Unused" ? { ...c, status: "Disabled" as AccessCodeStatus } : c,
        ),
      ],
    }));
    pushAudit({
      actor: state.user?.email ?? "admin@digdaya.nu.id",
      role: state.user?.role ?? "Super Admin",
      action: "REGENERATE_ACCESS_CODE",
      detail: `Regenerate kode untuk ${pc.nama}.`,
    });
    return newC;
  },

  // ===== Submissions =====
  submitJalurA(payload: {
    accessCode: string;
    namaAdmin: string;
    jabatan: string;
    nik: string;
    hp: string;
    email: string;
    suratTugasFile?: string;
  }): Registration | null {
    const code = state.accessCodes.find((c) => c.code === payload.accessCode);
    if (!code) return null;
    const { ticketId } = newTicket();
    const reg: Registration = {
      ticketId,
      jalur: "A" as Jalur,
      tipeOrg: "PC" as TipeOrg,
      namaOrg: code.pcName,
      pw: code.pw,
      accessCode: code.code,
      namaAdmin: payload.namaAdmin,
      jabatan: payload.jabatan,
      nik: payload.nik,
      hp: payload.hp,
      email: payload.email,
      suratTugasFile: payload.suratTugasFile,
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };
    setState((s) => ({ registrations: [reg, ...s.registrations] }));
    pushAudit({
      actor: payload.email,
      role: "Publik",
      action: "SUBMIT_JALUR_A",
      ticketId,
      detail: `Submit Jalur A untuk ${code.pcName}.`,
    });
    return reg;
  },

  submitJalurB(payload: {
    tipeOrg: TipeOrg;
    namaOrg: string;
    namaAdmin: string;
    jabatan: string;
    nik: string;
    hp: string;
    email: string;
    suratTugasFile?: string;
  }): Registration | null {
    const user = state.user;
    if (!user || user.role !== "PC" || !user.pcId) return null;
    const pc = masterPC.find((p) => p.id === user.pcId);
    if (!pc) return null;
    const { ticketId } = newTicket();
    const reg: Registration = {
      ticketId,
      jalur: "B" as Jalur,
      tipeOrg: payload.tipeOrg,
      namaOrg: payload.namaOrg,
      pw: pc.pw,
      sourcePcId: pc.id,
      sourcePcName: pc.nama,
      namaAdmin: payload.namaAdmin,
      jabatan: payload.jabatan,
      nik: payload.nik,
      hp: payload.hp,
      email: payload.email,
      suratTugasFile: payload.suratTugasFile,
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };
    setState((s) => ({ registrations: [reg, ...s.registrations] }));
    pushAudit({
      actor: user.email,
      role: "PC",
      action: "SUBMIT_JALUR_B",
      ticketId,
      detail: `${pc.nama} mendaftarkan ${payload.namaOrg} (${payload.tipeOrg}).`,
    });
    return reg;
  },

  // ===== Review =====
  approve(ticketId: string) {
    const user = state.user;
    const reg = state.registrations.find((r) => r.ticketId === ticketId);
    if (!reg) return;
    setState((s) => ({
      registrations: s.registrations.map((r) =>
        r.ticketId === ticketId
          ? {
              ...r,
              status: "Approved" as Status,
              reviewedAt: new Date().toISOString(),
              reviewedBy: user?.email ?? "reviewer@digdaya.nu.id",
              rejectReason: undefined,
            }
          : r,
      ),
      // tandai access code Used (Jalur A)
      accessCodes: reg.jalur === "A" && reg.accessCode
        ? s.accessCodes.map((c) =>
            c.code === reg.accessCode
              ? { ...c, status: "Used" as AccessCodeStatus, usedAt: new Date().toISOString(), ticketId }
              : c,
          )
        : s.accessCodes,
    }));
    pushAudit({
      actor: user?.email ?? "reviewer@digdaya.nu.id",
      role: user?.role ?? "Reviewer",
      action: "APPROVE_REGISTRATION",
      ticketId,
      detail: `Pendaftaran ${ticketId} disetujui.`,
    });
    pushAudit({
      actor: "system",
      role: "System",
      action: "AUTO_PROVISION_ACCOUNT",
      ticketId,
      detail: `Akun administrator ${reg.namaAdmin} dibuat dengan status menunggu aktivasi.`,
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

  // ===== Peruri =====
  generatePeruriBatch(): PeruriBatch | null {
    const eligible = state.registrations.filter((r) => r.status === "Approved" && !r.peruriBatchId);
    if (eligible.length === 0) return null;
    const seq = state.batches.length + 1;
    const id = `BATCH-2026-${String(seq).padStart(3, "0")}`;
    const batch: PeruriBatch = {
      id,
      date: new Date().toISOString().slice(0, 10),
      generatedAt: new Date().toISOString(),
      count: eligible.length,
      countA: eligible.filter((r) => r.jalur === "A").length,
      countB: eligible.filter((r) => r.jalur === "B").length,
      status: "Ready",
      ticketIds: eligible.map((r) => r.ticketId),
    };
    setState((s) => ({
      batches: [batch, ...s.batches],
      registrations: s.registrations.map((r) =>
        eligible.find((e) => e.ticketId === r.ticketId) ? { ...r, peruriBatchId: id } : r,
      ),
    }));
    pushAudit({
      actor: state.user?.email ?? "system",
      role: state.user?.role ?? "System",
      action: "GENERATE_PERURI_BATCH",
      detail: `Batch ${id} dibuat (${eligible.length} record, Jalur A: ${batch.countA}, Jalur B: ${batch.countB}).`,
    });
    return batch;
  },

  markBatchDownloaded(batchId: string) {
    const user = state.user;
    setState((s) => ({
      batches: s.batches.map((b) =>
        b.id === batchId ? { ...b, status: "Downloaded", downloadedBy: user?.email ?? "admin@digdaya.nu.id" } : b,
      ),
    }));
    pushAudit({
      actor: user?.email ?? "admin@digdaya.nu.id",
      role: user?.role ?? "Super Admin",
      action: "DOWNLOAD_PERURI_BATCH",
      detail: `Mengunduh batch ${batchId}.`,
    });
  },

  // ===== Auth =====
  login(email: string, password: string): User | null {
    if (password !== "password") return null;
    let user: User | null = null;
    if (email === "admin@digdaya.nu.id") {
      user = { email, name: "Super Admin Digdaya", role: "Super Admin" };
    } else if (email === "reviewer@digdaya.nu.id") {
      user = { email, name: "Reviewer Digdaya", role: "Reviewer" };
    } else if (email === "pc@digdaya.nu.id") {
      const pc = masterPC.find((p) => p.id === demoPcUserPcId)!;
      user = { email, name: "Administrator " + pc.nama, role: "PC", pcId: pc.id, pcName: pc.nama };
    }
    if (user) setState({ user });
    return user;
  },
  logout() { setState({ user: null }); },

  updateSLA(cfg: Partial<SLAConfig>) {
    setState((s) => ({ sla: { ...s.sla, ...cfg } }));
    pushAudit({
      actor: state.user?.email ?? "system",
      role: state.user?.role ?? "Super Admin",
      action: "UPDATE_SLA_SETTING",
      detail: "Konfigurasi SLA diperbarui.",
    });
  },
  updateNotif(cfg: Partial<NotifConfig>) { setState((s) => ({ notif: { ...s.notif, ...cfg } })); },
};
