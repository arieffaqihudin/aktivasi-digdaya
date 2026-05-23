import { useEffect, useSyncExternalStore } from "react";
import {
  seedRegistrations,
  seedPeruriBatches,
  seedAudit,
  seedAccessCodes,
  masterPC,
  masterPW,
  demoPcUserPcId,
  demoPwUserPwId,
  mockSuratTugasDigdaya,
  SURAT_TUGAS_CATEGORIES,
  type Registration,
  type PeruriBatch,
  type AuditEntry,
  type AccessCode,
  type AccessCodeStatus,
  type Status,
  type TipeOrg,
  type Tingkat,
  type SumberSuratTugas,
  type DokumenSistem,
  type RejectionCategory,
  type RevisionRequestEntry,
  type ResubmitEntry,
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
export type Role = "Super Admin" | "Reviewer" | "PC" | "PW";
export interface User {
  email: string;
  name: string;
  role: Role;
  pcId?: string;
  pcName?: string;
  pwId?: string;
  pwName?: string;
}

interface State {
  registrations: Registration[];
  batches: PeruriBatch[];
  audit: AuditEntry[];
  accessCodes: AccessCode[];
  /** runtime statusOrg overrides (id → status) — applied on top of masterPC/PW seeds */
  orgStatus: Record<string, "Production" | "Pending Aktivasi" | "Belum Production">;
  sla: SLAConfig;
  notif: NotifConfig;
  user: User | null;
  nextTicketSeq: number;
}

const STORAGE_KEY = "digdaya-portal-state-v3";

function initial(): State {
  return {
    registrations: seedRegistrations,
    batches: seedPeruriBatches,
    audit: seedAudit,
    accessCodes: seedAccessCodes,
    orgStatus: {},
    sla: { defaultDays: 3, greenMaxDays: 1, yellowMaxDays: 3, notifyEmails: "ops@digdaya.nu.id", defaultCodeValidDays: 30 },
    notif: { emailEnabled: true, whatsappEnabled: false },
    user: null,
    nextTicketSeq: 200,
  };
}

const serverSnapshot = initial();

function loadFromStorage(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial();
    const parsed = JSON.parse(raw);
    return { ...initial(), ...parsed };
  } catch {
    return initial();
  }
}

let state: State = initial();
let hasHydratedFromStorage = false;
const listeners = new Set<() => void>();

function emit() { listeners.forEach((l) => l()); }

function hydrateStateFromStorage() {
  if (typeof window === "undefined" || hasHydratedFromStorage) return;
  hasHydratedFromStorage = true;
  state = loadFromStorage();
  emit();
}

function persist() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}
function setState(next: Partial<State> | ((s: State) => Partial<State>)) {
  const patch = typeof next === "function" ? next(state) : next;
  state = { ...state, ...patch };
  persist();
  emit();
}
function subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); }
export function useStore<T>(selector: (s: State) => T): T {
  const selected = useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(serverSnapshot),
  );
  useEffect(() => { hydrateStateFromStorage(); }, []);
  return selected;
}
export function getState() { return state; }

/** Effective statusOrg for a master org id (PC/PW), considering runtime overrides. */
export function effectiveStatusOrg(orgId: string): "Production" | "Pending Aktivasi" | "Belum Production" {
  const override = state.orgStatus[orgId];
  if (override) return override;
  const pc = masterPC.find((p) => p.id === orgId);
  if (pc) return pc.statusOrg;
  const pw = masterPW.find((p) => p.id === orgId);
  if (pw) return pw.statusOrg;
  return "Belum Production";
}

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

  // ===== Surat tugas Digdaya Persuratan =====
  searchSuratTugasSistem(q: string): DokumenSistem[] {
    const s = q.trim().toLowerCase();
    if (!s) return mockSuratTugasDigdaya.slice(0, 6);
    return mockSuratTugasDigdaya.filter((d) =>
      d.namaDokumen.toLowerCase().includes(s) ||
      d.nomorSurat.toLowerCase().includes(s) ||
      d.penandatangan.toLowerCase().includes(s),
    );
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
      detail: `Verifikasi kode ${code.code} berhasil untuk ${code.orgName}.`,
    });
    return { ok: true, code };
  },

  generateAccessCodes(orgIds: string[], tingkat: Tingkat, validDays: number): AccessCode[] {
    const created: AccessCode[] = [];
    const now = new Date();
    const exp = new Date(now.getTime() + validDays * 86400000).toISOString();
    setState((s) => {
      let codes = [...s.accessCodes];
      for (const orgId of orgIds) {
        const eff = effectiveStatusOrg(orgId);
        if (eff === "Production") continue; // skip yang sudah production
        let orgName = "";
        let pw = "";
        if (tingkat === "PC") {
          const pc = masterPC.find((p) => p.id === orgId);
          if (!pc) continue;
          orgName = pc.nama; pw = pc.pw;
        } else {
          const pw0 = masterPW.find((p) => p.id === orgId);
          if (!pw0) continue;
          orgName = pw0.nama; pw = pw0.nama;
        }
        codes = codes.map((c) =>
          c.orgId === orgId && c.status === "Unused" ? { ...c, status: "Disabled" as AccessCodeStatus } : c,
        );
        const code: AccessCode = {
          code: randomCode(),
          tingkat,
          orgId,
          orgName,
          pw,
          status: "Unused",
          generatedAt: now.toISOString(),
          expiredAt: exp,
          ...(tingkat === "PC" ? { pcId: orgId, pcName: orgName } : {}),
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
      detail: `Generate ${created.length} kode akses tingkat ${tingkat} (berlaku ${validDays} hari).`,
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

  regenerateAccessCode(orgId: string, tingkat: Tingkat = "PC"): AccessCode | null {
    return this.generateAccessCodes([orgId], tingkat, state.sla.defaultCodeValidDays)[0] ?? null;
  },

  // ===== Submissions =====
  submitPublicActivation(payload: {
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
      jalur: "A",
      sumberPengajuan: "PUBLIC",
      tingkatPendaftar: code.tingkat,
      tipeOrg: code.tingkat === "PW" ? "PW" : "PC",
      namaOrg: code.orgName,
      pw: code.pw,
      accessCode: code.code,
      namaAdmin: payload.namaAdmin,
      jabatan: payload.jabatan,
      nik: payload.nik,
      hp: payload.hp,
      email: payload.email,
      sumberSuratTugas: "MANUAL_UPLOAD",
      suratTugasFile: payload.suratTugasFile ?? "surat-tugas.pdf",
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };
    setState((s) => ({
      registrations: [reg, ...s.registrations],
      orgStatus: { ...s.orgStatus, [code.orgId]: "Pending Aktivasi" },
    }));
    pushAudit({
      actor: payload.email,
      role: "Publik",
      action: "SUBMIT_PUBLIC_ACTIVATION",
      ticketId,
      detail: `Submit aktivasi publik untuk ${code.orgName} (${code.tingkat}).`,
    });
    return reg;
  },

  submitInternal(payload: {
    tipeOrg: TipeOrg;
    namaOrg: string;
    namaAdmin: string;
    jabatan: string;
    nik: string;
    hp: string;
    email: string;
    sumberSuratTugas: SumberSuratTugas;
    suratTugasFile?: string;
    dokumenSistem?: DokumenSistem;
  }): Registration | null {
    const user = state.user;
    if (!user || (user.role !== "PC" && user.role !== "PW")) return null;
    const { ticketId } = newTicket();

    let pw = "";
    const base: Partial<Registration> = {};
    if (user.role === "PC") {
      const pc = masterPC.find((p) => p.id === user.pcId);
      if (!pc) return null;
      pw = pc.pw;
      base.sourcePcId = pc.id;
      base.sourcePcName = pc.nama;
      base.sumberPengajuan = "PC_DASHBOARD";
      base.tingkatPendaftar = "PC";
    } else {
      const pw0 = masterPW.find((p) => p.id === user.pwId);
      if (!pw0) return null;
      pw = pw0.nama;
      base.sourcePwId = pw0.id;
      base.sourcePwName = pw0.nama;
      base.sumberPengajuan = "PW_DASHBOARD";
      base.tingkatPendaftar = "PW";
    }

    const reg: Registration = {
      ticketId,
      jalur: "B",
      sumberPengajuan: base.sumberPengajuan!,
      tingkatPendaftar: base.tingkatPendaftar!,
      tipeOrg: payload.tipeOrg,
      namaOrg: payload.namaOrg,
      pw,
      sourcePcId: base.sourcePcId,
      sourcePcName: base.sourcePcName,
      sourcePwId: base.sourcePwId,
      sourcePwName: base.sourcePwName,
      namaAdmin: payload.namaAdmin,
      jabatan: payload.jabatan,
      nik: payload.nik,
      hp: payload.hp,
      email: payload.email,
      sumberSuratTugas: payload.sumberSuratTugas,
      suratTugasFile: payload.sumberSuratTugas === "MANUAL_UPLOAD" ? (payload.suratTugasFile ?? "surat-tugas.pdf") : undefined,
      dokumenSistem: payload.sumberSuratTugas === "DIGDAYA_PERSURATAN" ? payload.dokumenSistem : undefined,
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };
    setState((s) => ({ registrations: [reg, ...s.registrations] }));
    pushAudit({
      actor: user.email,
      role: user.role,
      action: "SUBMIT_INTERNAL",
      ticketId,
      detail: `${user.role === "PC" ? user.pcName : user.pwName} mendaftarkan ${payload.namaOrg} (${payload.tipeOrg}) — surat: ${payload.sumberSuratTugas === "DIGDAYA_PERSURATAN" ? "Dari Sistem" : "Upload Manual"}.`,
    });
    return reg;
  },

  // ===== Review =====
  approve(ticketId: string) {
    const user = state.user;
    const reg = state.registrations.find((r) => r.ticketId === ticketId);
    if (!reg) return;

    // Tentukan org yang harus diubah jadi production (jika ini aktivasi publik)
    let setOrgProduction: string | null = null;
    if (reg.sumberPengajuan === "PUBLIC" && reg.accessCode) {
      const code = state.accessCodes.find((c) => c.code === reg.accessCode);
      if (code) setOrgProduction = code.orgId;
    }

    setState((s) => ({
      registrations: s.registrations.map((r) =>
        r.ticketId === ticketId
          ? { ...r, status: "Approved" as Status, reviewedAt: new Date().toISOString(), reviewedBy: user?.email ?? "reviewer@digdaya.nu.id", rejectReason: undefined }
          : r,
      ),
      accessCodes: reg.accessCode
        ? s.accessCodes.map((c) =>
            c.code === reg.accessCode
              ? { ...c, status: "Used" as AccessCodeStatus, usedAt: new Date().toISOString(), ticketId }
              : c,
          )
        : s.accessCodes,
      orgStatus: setOrgProduction
        ? { ...s.orgStatus, [setOrgProduction]: "Production" }
        : s.orgStatus,
    }));

    pushAudit({
      actor: user?.email ?? "reviewer@digdaya.nu.id",
      role: user?.role ?? "Reviewer",
      action: "APPROVE_REGISTRATION",
      ticketId,
      detail: setOrgProduction
        ? `Pendaftaran ${ticketId} disetujui. ${reg.namaOrg} menjadi Production.`
        : `Pendaftaran ${ticketId} disetujui.`,
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
          ? { ...r, status: "Rejected" as Status, reviewedAt: new Date().toISOString(), reviewedBy: user?.email ?? "reviewer@digdaya.nu.id", rejectReason: reason }
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
      detail: `Batch ${id} dibuat (${eligible.length} record).`,
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
    } else if (email === "pw@digdaya.nu.id") {
      const pw = masterPW.find((p) => p.id === demoPwUserPwId)!;
      user = { email, name: "Administrator " + pw.nama, role: "PW", pwId: pw.id, pwName: pw.nama };
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
