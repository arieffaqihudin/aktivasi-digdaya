import { useEffect, useSyncExternalStore } from "react";
import { notifActions } from "./notifications";
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
import {
  seedUsers,
  seedRoles,
  type UserAccount,
  type RoleDef,
  type RoleName,
  type PermissionKey,
  type UserStatus,
} from "@/data/usersData";

export interface SLAConfig {
  defaultDays: number;
  greenMaxDays: number;
  yellowMaxDays: number;
  notifyEmails: string;
  defaultCodeValidDays: number;
  maxRevisions: number;
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
  users: UserAccount[];
  roles: RoleDef[];
  /** runtime statusOrg overrides (id → status) — applied on top of masterPC/PW seeds */
  orgStatus: Record<string, "Production" | "Pending Aktivasi" | "Belum Production">;
  sla: SLAConfig;
  notif: NotifConfig;
  user: User | null;
  nextTicketSeq: number;
}

const STORAGE_KEY = "digdaya-portal-state-v9";

function initial(): State {
  return {
    registrations: seedRegistrations,
    batches: seedPeruriBatches,
    audit: seedAudit,
    accessCodes: seedAccessCodes,
    users: seedUsers,
    roles: seedRoles,
    orgStatus: {},
    sla: { defaultDays: 3, greenMaxDays: 1, yellowMaxDays: 3, notifyEmails: "ops@digdaya.nu.id", defaultCodeValidDays: 30, maxRevisions: 3 },
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
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => serverSnapshot,
  );
  useEffect(() => { hydrateStateFromStorage(); }, []);
  return selector(snapshot);
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

/** Determine submitter notification target (role + orgId + status route) for a registration. */
function submitterTarget(reg: Registration): { role: "PC" | "PW"; orgId: string; route: string } | null {
  if (reg.sumberPengajuan === "PC_DASHBOARD" && reg.sourcePcId) {
    return { role: "PC", orgId: reg.sourcePcId, route: `/pc/status-pengajuan/${reg.ticketId}` };
  }
  if (reg.sumberPengajuan === "PW_DASHBOARD" && reg.sourcePwId) {
    return { role: "PW", orgId: reg.sourcePwId, route: `/pw/status-pengajuan/${reg.ticketId}` };
  }
  return null;
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
    if (created.length > 0) {
      notifActions.add({
        recipientRole: "OPS",
        type: "ACCESS_CODE_CREATED",
        title: "Kode akses berhasil dibuat",
        description: `${created.length} kode akses tingkat ${tingkat} berhasil dibuat.`,
        route: "/ops/activation/access-codes",
      });
    }
    return created;
  },

  /** Cek apakah kode sudah ada (case-insensitive). */
  accessCodeExists(code: string): boolean {
    const c = code.trim().toUpperCase();
    return state.accessCodes.some((x) => x.code.toUpperCase() === c);
  },

  /** Buat Scoped Batch Code untuk PW/PC dalam scope wilayah tertentu. */
  createScopedAccessCode(input: {
    code: string;
    batchName: string;
    tingkat: Tingkat;
    wilayahPwId: string; // "Nasional" atau pw-id
    mode: "auto" | "whitelist";
    whitelist?: string[];
    validDays: number;
    note?: string;
  }): AccessCode | null {
    const codeStr = input.code.trim().toUpperCase();
    if (!codeStr || actions.accessCodeExists(codeStr)) return null;
    const now = new Date();
    const exp = new Date(now.getTime() + input.validDays * 86400000).toISOString();
    const pwName =
      input.wilayahPwId === "Nasional"
        ? "Nasional"
        : (masterPW.find((p) => p.id === input.wilayahPwId)?.nama ?? "Nasional");
    const newCode: AccessCode = {
      code: codeStr,
      tingkat: input.tingkat,
      orgId: "",
      orgName: input.batchName,
      pw: pwName,
      kind: "Scoped",
      batchName: input.batchName,
      scope: {
        wilayahPwId: input.wilayahPwId,
        mode: input.mode,
        whitelist: input.mode === "whitelist" ? (input.whitelist ?? []) : undefined,
      },
      status: "Unused",
      generatedAt: now.toISOString(),
      expiredAt: exp,
    };
    setState((s) => ({ accessCodes: [newCode, ...s.accessCodes] }));
    pushAudit({
      actor: state.user?.email ?? "system",
      role: state.user?.role ?? "Super Admin",
      action: "GENERATE_ACCESS_CODE",
      detail: `Scoped batch ${codeStr} (${input.tingkat} · ${pwName}) dibuat. Mode ${input.mode}. Berlaku ${input.validDays} hari.${input.note ? " Catatan: " + input.note : ""}`,
    });
    notifActions.add({
      recipientRole: "OPS",
      type: "ACCESS_CODE_CREATED",
      title: "Kode akses berhasil dibuat",
      description: `${codeStr} telah dibuat untuk scope ${input.tingkat} · ${pwName}.`,
      route: "/ops/activation/access-codes",
    });
    return newCode;
  },

  /** Buat Individual Code untuk satu organisasi (PW/PC) tertentu. */
  createIndividualAccessCode(input: {
    code: string;
    batchName?: string;
    tingkat: Tingkat;
    orgId: string;
    validDays: number;
    note?: string;
  }): AccessCode | null {
    const codeStr = input.code.trim().toUpperCase();
    if (!codeStr || actions.accessCodeExists(codeStr)) return null;
    const list = input.tingkat === "PC" ? masterPC : masterPW;
    const org = list.find((o) => o.id === input.orgId);
    if (!org) return null;
    if (effectiveStatusOrg(org.id) === "Production") return null;
    const now = new Date();
    const exp = new Date(now.getTime() + input.validDays * 86400000).toISOString();
    const pwName = "pw" in org ? (org as { pw: string }).pw : org.nama;
    const newCode: AccessCode = {
      code: codeStr,
      tingkat: input.tingkat,
      orgId: org.id,
      orgName: org.nama,
      pw: pwName,
      kind: "Individual",
      batchName: input.batchName,
      status: "Unused",
      generatedAt: now.toISOString(),
      expiredAt: exp,
      ...(input.tingkat === "PC" ? { pcId: org.id, pcName: org.nama } : {}),
    };
    setState((s) => ({ accessCodes: [newCode, ...s.accessCodes] }));
    pushAudit({
      actor: state.user?.email ?? "system",
      role: state.user?.role ?? "Super Admin",
      action: "GENERATE_ACCESS_CODE",
      detail: `Individual code ${codeStr} dibuat untuk ${org.nama} (${input.tingkat}). Berlaku ${input.validDays} hari.${input.note ? " Catatan: " + input.note : ""}`,
    });
    notifActions.add({
      recipientRole: "OPS",
      type: "ACCESS_CODE_CREATED",
      title: "Kode akses berhasil dibuat",
      description: `${codeStr} telah dibuat untuk ${org.nama} (${input.tingkat}).`,
      route: "/ops/activation/access-codes",
    });
    return newCode;
  },

  /** Tambah masa berlaku kode akses (hari). */
  extendAccessCode(code: string, days: number) {
    setState((s) => ({
      accessCodes: s.accessCodes.map((c) => {
        if (c.code !== code) return c;
        const base = new Date(c.expiredAt).getTime();
        const from = Math.max(base, Date.now());
        const newExp = new Date(from + days * 86400000).toISOString();
        const newStatus: AccessCodeStatus = c.status === "Expired" ? "Unused" : c.status;
        return { ...c, expiredAt: newExp, status: newStatus };
      }),
    }));
    pushAudit({
      actor: state.user?.email ?? "system",
      role: state.user?.role ?? "Super Admin",
      action: "EXTEND_ACCESS_CODE",
      detail: `Masa berlaku ${code} diperpanjang ${days} hari.`,
    });
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

  // ===== Eligible orgs for Scoped batch codes =====
  /**
   * Untuk Scoped code: kembalikan daftar organisasi master sesuai scope,
   * berstatus Belum Production, dengan penanda apakah sedang ada pengajuan aktif.
   */
  getEligibleOrgsForCode(code: AccessCode): Array<{
    id: string;
    nama: string;
    tingkat: Tingkat;
    pwName: string;
    statusOrg: "Belum Production" | "Pending Aktivasi" | "Production";
    hasActiveSubmission: boolean;
    activeStatus?: Status;
  }> {
    const scopePw = code.scope?.wilayahPwId ?? "Nasional";
    const whitelist = code.scope?.mode === "whitelist" ? (code.scope.whitelist ?? []) : null;

    const list = code.tingkat === "PC"
      ? masterPC.map((p) => ({ id: p.id, nama: p.nama, pwId: p.pwId, pwName: p.pw }))
      : masterPW.map((p) => ({ id: p.id, nama: p.nama, pwId: p.id, pwName: p.nama }));

    const filtered = list.filter((o) => {
      if (whitelist && !whitelist.includes(o.id)) return false;
      if (scopePw !== "Nasional" && o.pwId !== scopePw) return false;
      return true;
    });

    return filtered
      .map((o) => {
        const statusOrg = effectiveStatusOrg(o.id);
        const activeReg = state.registrations.find(
          (r) =>
            ((r.tipeOrg === "PC" && r.accessCode && state.accessCodes.find((c) => c.code === r.accessCode)?.orgId === o.id) ||
              (r.sumberPengajuan === "PUBLIC" && (r as Registration & { selectedOrgId?: string }).selectedOrgId === o.id)) &&
            (r.status === "Pending" || r.status === "PerluPerbaikan"),
        );
        return {
          id: o.id,
          nama: o.nama,
          tingkat: code.tingkat,
          pwName: o.pwName,
          statusOrg,
          hasActiveSubmission: !!activeReg || statusOrg === "Pending Aktivasi",
          activeStatus: activeReg?.status,
        };
      })
      .filter((o) => o.statusOrg !== "Production"); // sembunyikan yang sudah Production
  },

  // ===== Submissions =====
  submitPublicActivation(payload: {
    accessCode: string;
    selectedOrgId?: string;
    namaAdmin: string;
    jabatan: string;
    nik: string;
    hp: string;
    email: string;
    suratTugasFile?: string;
  }): Registration | null {
    const code = state.accessCodes.find((c) => c.code === payload.accessCode);
    if (!code) return null;

    // Tentukan target organisasi: Scoped → pilihan user; Individual → orgId di code.
    let targetOrgId = code.orgId;
    let targetOrgName = code.orgName;
    let targetPw = code.pw;
    if (code.kind === "Scoped") {
      if (!payload.selectedOrgId) return null;
      if (code.tingkat === "PC") {
        const pc = masterPC.find((p) => p.id === payload.selectedOrgId);
        if (!pc) return null;
        targetOrgId = pc.id; targetOrgName = pc.nama; targetPw = pc.pw;
      } else {
        const pw = masterPW.find((p) => p.id === payload.selectedOrgId);
        if (!pw) return null;
        targetOrgId = pw.id; targetOrgName = pw.nama; targetPw = pw.nama;
      }
      // Cegah duplikasi
      if (effectiveStatusOrg(targetOrgId) !== "Belum Production") return null;
    }

    const { ticketId } = newTicket();
    const reg: Registration = {
      ticketId,
      jalur: "A",
      sumberPengajuan: "PUBLIC",
      tingkatPendaftar: code.tingkat,
      tipeOrg: code.tingkat === "PW" ? "PW" : "PC",
      namaOrg: targetOrgName,
      pw: targetPw,
      accessCode: code.code,
      selectedOrgId: code.kind === "Scoped" ? targetOrgId : undefined,
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
      orgStatus: { ...s.orgStatus, [targetOrgId]: "Pending Aktivasi" },
    }));
    pushAudit({
      actor: payload.email,
      role: "Publik",
      action: "SUBMIT_PUBLIC_ACTIVATION",
      ticketId,
      detail: `Submit aktivasi publik untuk ${targetOrgName} (${code.tingkat})${code.kind === "Scoped" ? ` via batch ${code.batchName ?? code.code}` : ""}.`,
    });
    notifActions.broadcast([
      {
        recipientRole: "REVIEWER",
        type: "NEW_SUBMISSION",
        title: "Pengajuan baru masuk",
        description: `${targetOrgName} menunggu review Tim Digdaya (via kode akses).`,
        ticketId,
        route: `/review/inbox/${ticketId}`,
      },
      {
        recipientRole: "OPS",
        type: "NEW_SUBMISSION",
        title: "Pengajuan baru via kode akses",
        description: `${targetOrgName} mengajukan aktivasi melalui ${code.code}.`,
        ticketId,
        route: `/ops/activation/submissions/${ticketId}`,
      },
    ]);
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
    const submitterName = user.role === "PC" ? user.pcName : user.pwName;
    const statusRoute = user.role === "PC" ? `/pc/status-pengajuan/${ticketId}` : `/pw/status-pengajuan/${ticketId}`;
    notifActions.broadcast([
      {
        recipientRole: "REVIEWER",
        type: "NEW_SUBMISSION",
        title: `Pengajuan baru dari ${submitterName}`,
        description: `${payload.namaOrg} menunggu review Tim Digdaya.`,
        ticketId,
        route: `/review/inbox/${ticketId}`,
      },
      {
        recipientRole: user.role === "PC" ? "PC" : "PW",
        recipientOrgId: user.role === "PC" ? user.pcId : user.pwId,
        type: "NEW_SUBMISSION",
        title: "Pengajuan berhasil dikirim",
        description: `${payload.namaOrg} sedang menunggu review Tim Digdaya.`,
        ticketId,
        route: statusRoute,
      },
    ]);
    return reg;
  },

  /** Khusus PC mendaftarkan Ranting — input nama Ranting manual karena belum ada master data. */
  submitRanting(payload: {
    namaRanting: string;
    parentMwcId: string;
    parentMwcName: string;
    village?: string;
    locationNote?: string;
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
    if (!user || user.role !== "PC") return null;
    const pc = masterPC.find((p) => p.id === user.pcId);
    if (!pc) return null;
    const { ticketId } = newTicket();
    const slug = payload.namaRanting.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const rantingId = `ranting-${slug}-${ticketId.slice(-6)}`;
    const reg: Registration = {
      ticketId,
      jalur: "B",
      sumberPengajuan: "PC_DASHBOARD",
      tingkatPendaftar: "PC",
      tipeOrg: "Ranting",
      namaOrg: payload.namaRanting,
      pw: pc.pw,
      sourcePcId: pc.id,
      sourcePcName: user.pcName ?? pc.nama,
      selectedOrgId: rantingId,
      parentMwcId: payload.parentMwcId,
      parentMwcName: payload.parentMwcName,
      village: payload.village,
      locationNote: payload.locationNote,
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
    setState((s) => ({
      registrations: [reg, ...s.registrations],
      orgStatus: { ...s.orgStatus, [rantingId]: "Pending Aktivasi" },
    }));
    pushAudit({
      actor: user.email,
      role: user.role,
      action: "SUBMIT_RANTING",
      ticketId,
      detail: `${user.pcName ?? pc.nama} mendaftarkan ${payload.namaRanting} (Ranting, induk ${payload.parentMwcName}).`,
    });
    notifActions.broadcast([
      {
        recipientRole: "REVIEWER",
        type: "NEW_SUBMISSION",
        title: `Pengajuan Ranting baru`,
        description: `${payload.namaRanting} (di bawah ${payload.parentMwcName}) menunggu review.`,
        ticketId,
        route: `/review/inbox/${ticketId}`,
      },
      {
        recipientRole: "PC",
        recipientOrgId: pc.id,
        type: "NEW_SUBMISSION",
        title: "Pengajuan Ranting dikirim",
        description: `${payload.namaRanting} sedang menunggu review Tim Digdaya.`,
        ticketId,
        route: `/pc/status-pengajuan/${ticketId}`,
      },
      {
        recipientRole: "OPS",
        type: "NEW_SUBMISSION",
        title: "Pengajuan Ranting baru",
        description: `${payload.namaRanting} didaftarkan oleh ${user.pcName ?? pc.nama}.`,
        ticketId,
        route: `/ops/activation/submissions/${ticketId}`,
      },
    ]);
    return reg;
  },

  // ===== Review =====

  approve(ticketId: string) {
    const user = state.user;
    const reg = state.registrations.find((r) => r.ticketId === ticketId);
    if (!reg) return;

    // Tentukan org yang harus diubah jadi production.
    // - Aktivasi publik: Scoped → selectedOrgId; Individual → code.orgId.
    // - Ranting dari PC dashboard: selectedOrgId = ranting id (baru).
    let setOrgProduction: string | null = null;
    if (reg.sumberPengajuan === "PUBLIC" && reg.accessCode) {
      if (reg.selectedOrgId) {
        setOrgProduction = reg.selectedOrgId;
      } else {
        const code = state.accessCodes.find((c) => c.code === reg.accessCode);
        if (code && code.orgId) setOrgProduction = code.orgId;
      }
    } else if (reg.tipeOrg === "Ranting" && reg.selectedOrgId) {
      setOrgProduction = reg.selectedOrgId;
    }


    // Scoped batch codes tetap reusable setelah approve (status tidak diubah ke "Used").
    const codeForReg = reg.accessCode ? state.accessCodes.find((c) => c.code === reg.accessCode) : null;
    const shouldMarkCodeUsed = !!codeForReg && codeForReg.kind !== "Scoped";


    setState((s) => ({
      registrations: s.registrations.map((r) =>
        r.ticketId === ticketId
          ? { ...r, status: "Approved" as Status, reviewedAt: new Date().toISOString(), reviewedBy: user?.email ?? "reviewer@digdaya.nu.id", rejectReason: undefined }
          : r,
      ),
      accessCodes: shouldMarkCodeUsed
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
    const tgt = submitterTarget(reg);
    const notifs: Parameters<typeof notifActions.broadcast>[0] = [
      {
        recipientRole: "OPS",
        type: "APPROVED",
        title: "Pengajuan disetujui",
        description: `${reg.namaOrg} (${ticketId}) telah disetujui reviewer.`,
        ticketId,
        route: `/ops/activation/submissions/${ticketId}`,
      },
    ];
    if (tgt) {
      notifs.push({
        recipientRole: tgt.role,
        recipientOrgId: tgt.orgId,
        type: "APPROVED",
        title: "Pengajuan disetujui",
        description: `${reg.namaOrg} sudah production di Digdaya.`,
        ticketId,
        route: tgt.route,
      });
    }
    notifActions.broadcast(notifs);
  },

  /** Reviewer meminta perbaikan — status berubah jadi PerluPerbaikan. */
  requestRevision(ticketId: string, payload: { category: RejectionCategory; note: string }) {
    const user = state.user;
    const entry: RevisionRequestEntry = {
      at: new Date().toISOString(),
      reviewer: user?.email ?? "reviewer@digdaya.nu.id",
      decision: "PerluPerbaikan",
      category: payload.category,
      note: payload.note,
    };
    setState((s) => ({
      registrations: s.registrations.map((r) =>
        r.ticketId === ticketId
          ? {
              ...r,
              status: "PerluPerbaikan" as Status,
              reviewedAt: new Date().toISOString(),
              reviewedBy: entry.reviewer,
              rejectReason: payload.note,
              rejectionCategory: payload.category,
              revisionHistory: [...(r.revisionHistory ?? []), entry],
            }
          : r,
      ),
    }));
    pushAudit({
      actor: entry.reviewer,
      role: user?.role ?? "Reviewer",
      action: "REQUEST_REVISION",
      ticketId,
      detail: `Pengajuan ${ticketId} diminta perbaikan. Kategori: ${payload.category}. Catatan: ${payload.note}`,
    });
    const reg = state.registrations.find((r) => r.ticketId === ticketId);
    const tgt = reg ? submitterTarget(reg) : null;
    if (tgt) {
      const revisiRoute = tgt.route + "/revisi";
      notifActions.add({
        recipientRole: tgt.role,
        recipientOrgId: tgt.orgId,
        type: "REVISION_REQUESTED",
        title: "Pengajuan perlu perbaikan",
        description: `Pengajuan ${reg!.namaOrg} perlu diperbaiki. Silakan cek catatan reviewer.`,
        ticketId,
        route: revisiRoute,
      });
    }
  },

  /** Reviewer menolak final — tidak bisa diperbaiki lagi. */
  rejectFinal(ticketId: string, payload: { category: RejectionCategory; note: string }) {
    const user = state.user;
    const entry: RevisionRequestEntry = {
      at: new Date().toISOString(),
      reviewer: user?.email ?? "reviewer@digdaya.nu.id",
      decision: "RejectedFinal",
      category: payload.category,
      note: payload.note,
    };
    setState((s) => ({
      registrations: s.registrations.map((r) =>
        r.ticketId === ticketId
          ? {
              ...r,
              status: "RejectedFinal" as Status,
              reviewedAt: new Date().toISOString(),
              reviewedBy: entry.reviewer,
              rejectReason: payload.note,
              rejectionCategory: payload.category,
              revisionHistory: [...(r.revisionHistory ?? []), entry],
            }
          : r,
      ),
    }));
    pushAudit({
      actor: entry.reviewer,
      role: user?.role ?? "Reviewer",
      action: "REJECT_FINAL",
      ticketId,
      detail: `Pengajuan ${ticketId} ditolak final. Kategori: ${payload.category}. Catatan: ${payload.note}`,
    });
    const regRF = state.registrations.find((r) => r.ticketId === ticketId);
    const tgtRF = regRF ? submitterTarget(regRF) : null;
    const rfNotifs: Parameters<typeof notifActions.broadcast>[0] = [
      {
        recipientRole: "OPS",
        type: "REJECTED_FINAL",
        title: "Pengajuan ditolak final",
        description: `${regRF?.namaOrg ?? ticketId} ditolak final oleh reviewer.`,
        ticketId,
        route: `/ops/activation/submissions/${ticketId}`,
      },
    ];
    if (tgtRF) {
      rfNotifs.push({
        recipientRole: tgtRF.role,
        recipientOrgId: tgtRF.orgId,
        type: "REJECTED_FINAL",
        title: "Pengajuan ditolak final",
        description: "Pengajuan tidak dapat dilanjutkan. Silakan hubungi Tim Digdaya jika perlu bantuan.",
        ticketId,
        route: tgtRF.route,
      });
    }
    notifActions.broadcast(rfNotifs);
  },

  /** Backward-compat alias — defaults to PerluPerbaikan. */
  reject(ticketId: string, reason: string) {
    this.requestRevision(ticketId, { category: "LAINNYA", note: reason });
  },

  /** Pendaftar mengirim revisi. Kembalikan status ke Pending Review. */
  resubmitRevision(
    ticketId: string,
    payload: {
      namaAdmin?: string;
      jabatan?: string;
      nik?: string;
      hp?: string;
      email?: string;
      sumberSuratTugas?: SumberSuratTugas;
      suratTugasFile?: string;
      dokumenSistem?: DokumenSistem;
      submitterEmail?: string;
      submitterRole?: string;
    },
  ): Registration | null {
    const reg = state.registrations.find((r) => r.ticketId === ticketId);
    if (!reg) return null;
    if (reg.status !== "PerluPerbaikan") return null;

    const previous: ResubmitEntry["previous"] = {
      namaAdmin: reg.namaAdmin,
      jabatan: reg.jabatan,
      nik: reg.nik,
      hp: reg.hp,
      email: reg.email,
      sumberSuratTugas: reg.sumberSuratTugas,
      suratTugasFile: reg.suratTugasFile,
      dokumenSistem: reg.dokumenSistem,
    };

    const next: Registration = {
      ...reg,
      namaAdmin: payload.namaAdmin ?? reg.namaAdmin,
      jabatan: payload.jabatan ?? reg.jabatan,
      nik: payload.nik ?? reg.nik,
      hp: payload.hp ?? reg.hp,
      email: payload.email ?? reg.email,
      sumberSuratTugas: payload.sumberSuratTugas ?? reg.sumberSuratTugas,
      suratTugasFile:
        (payload.sumberSuratTugas ?? reg.sumberSuratTugas) === "MANUAL_UPLOAD"
          ? (payload.suratTugasFile ?? reg.suratTugasFile ?? "surat-tugas.pdf")
          : undefined,
      dokumenSistem:
        (payload.sumberSuratTugas ?? reg.sumberSuratTugas) === "DIGDAYA_PERSURATAN"
          ? (payload.dokumenSistem ?? reg.dokumenSistem)
          : undefined,
      status: "Pending",
      reviewedAt: undefined,
      reviewedBy: undefined,
    };

    const changed: string[] = [];
    if (previous.namaAdmin !== next.namaAdmin) changed.push("namaAdmin");
    if (previous.jabatan !== next.jabatan) changed.push("jabatan");
    if (previous.nik !== next.nik) changed.push("nik");
    if (previous.hp !== next.hp) changed.push("hp");
    if (previous.email !== next.email) changed.push("email");
    if (previous.sumberSuratTugas !== next.sumberSuratTugas) changed.push("sumberSuratTugas");
    if (previous.suratTugasFile !== next.suratTugasFile) changed.push("suratTugasFile");
    if (previous.dokumenSistem?.documentId !== next.dokumenSistem?.documentId) changed.push("dokumenSistem");

    const resubmit: ResubmitEntry = {
      at: new Date().toISOString(),
      by: payload.submitterEmail ?? next.email,
      changedFields: changed,
      previous,
    };

    next.resubmitHistory = [...(reg.resubmitHistory ?? []), resubmit];
    next.revisionCount = (reg.revisionCount ?? 0) + 1;

    setState((s) => ({
      registrations: s.registrations.map((r) => (r.ticketId === ticketId ? next : r)),
    }));

    pushAudit({
      actor: resubmit.by,
      role: payload.submitterRole ?? "Pendaftar",
      action: "RESUBMIT_REVISION",
      ticketId,
      detail: `Revisi ke-${next.revisionCount} dikirim. Perubahan: ${changed.length ? changed.join(", ") : "tidak ada"}.`,
    });
    const tgtRS = submitterTarget(next);
    notifActions.broadcast([
      {
        recipientRole: "REVIEWER",
        type: "REVISION_SUBMITTED",
        title: "Revisi pengajuan dikirim",
        description: `${next.namaOrg} mengirim revisi ke-${next.revisionCount}.`,
        ticketId,
        route: `/review/inbox/${ticketId}`,
      },
      ...(tgtRS
        ? [
            {
              recipientRole: tgtRS.role,
              recipientOrgId: tgtRS.orgId,
              type: "REVISION_SUBMITTED" as const,
              title: "Revisi berhasil dikirim",
              description: "Pengajuan akan direview kembali oleh Tim Digdaya.",
              ticketId,
              route: tgtRS.route,
            },
          ]
        : []),
    ]);
    return next;
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
    notifActions.broadcast([
      {
        recipientRole: "OPS",
        type: "PERURI_EXPORT_READY",
        title: "Export Peruri siap",
        description: `Batch ${id} berhasil dibuat dan berisi ${eligible.length} record yang sudah disetujui.`,
        route: "/ops/activation/peruri-export",
      },
      {
        recipientRole: "REVIEWER",
        type: "PERURI_EXPORT_READY",
        title: "Export Peruri siap",
        description: `Batch ${id} berhasil dibuat (${eligible.length} record).`,
        route: "/review/peruri",
      },
    ]);
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
    return actions.loginAs(email);
  },
  /** Passwordless login (NU.ID / OTP). Unknown email defaults to PC production user. */
  loginAs(email: string): User | null {
    const e = email.trim().toLowerCase();
    let user: User | null = null;
    if (e === "admin@digdaya.nu.id") {
      user = { email: e, name: "Super Admin Digdaya", role: "Super Admin" };
    } else if (e === "reviewer@digdaya.nu.id") {
      user = { email: e, name: "Reviewer Digdaya", role: "Reviewer" };
    } else if (e === "pw@digdaya.nu.id") {
      const pw = masterPW.find((p) => p.id === demoPwUserPwId)!;
      user = { email: e, name: "Administrator " + pw.nama, role: "PW", pwId: pw.id, pwName: pw.nama };
    } else if (e === "pc.kraksaan@digdaya.nu.id") {
      const pc = masterPC.find((p) => p.id === demoPcUserPcId)!;
      user = { email: e, name: "Admin PCNU Kraksaan", role: "PC", pcId: pc.id, pcName: "PCNU Kraksaan" };
    } else if (e === "pc@digdaya.nu.id") {
      const pc = masterPC.find((p) => p.id === demoPcUserPcId)!;
      user = { email: e, name: "Administrator " + pc.nama, role: "PC", pcId: pc.id, pcName: pc.nama };
    } else {
      const pc = masterPC.find((p) => p.id === demoPcUserPcId)!;
      user = { email: e, name: "Admin PCNU Kraksaan", role: "PC", pcId: pc.id, pcName: "PCNU Kraksaan" };
    }
    setState({ user });
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

  // ===== Users & Roles =====
  createUser(input: Omit<UserAccount, "id" | "createdAt" | "lastLoginAt">): UserAccount {
    const user: UserAccount = {
      ...input,
      id: "u-" + Math.random().toString(36).slice(2, 10),
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ users: [user, ...s.users] }));
    pushAudit({
      actor: state.user?.email ?? "system",
      role: state.user?.role ?? "Super Admin",
      action: "CREATE_USER",
      detail: `Menambahkan pengguna ${user.name} (${user.email}) sebagai ${user.role}.`,
    });
    return user;
  },

  updateUser(id: string, patch: Partial<UserAccount>) {
    let updated: UserAccount | undefined;
    setState((s) => ({
      users: s.users.map((u) => {
        if (u.id !== id) return u;
        updated = { ...u, ...patch };
        return updated;
      }),
    }));
    if (updated) {
      pushAudit({
        actor: state.user?.email ?? "system",
        role: state.user?.role ?? "Super Admin",
        action: "UPDATE_USER",
        detail: `Memperbarui pengguna ${updated.name} (${updated.email}).`,
      });
    }
  },

  setUserStatus(id: string, status: UserStatus) {
    const u = state.users.find((x) => x.id === id);
    if (!u) return;
    setState((s) => ({ users: s.users.map((x) => (x.id === id ? { ...x, status } : x)) }));
    pushAudit({
      actor: state.user?.email ?? "system",
      role: state.user?.role ?? "Super Admin",
      action: status === "Aktif" ? "ENABLE_USER" : "DISABLE_USER",
      detail: `${status === "Aktif" ? "Mengaktifkan" : "Menonaktifkan"} pengguna ${u.name}.`,
    });
  },

  resetUserAccess(id: string) {
    const u = state.users.find((x) => x.id === id);
    if (!u) return;
    setState((s) => ({
      users: s.users.map((x) => (x.id === id ? { ...x, permissions: undefined } : x)),
    }));
    pushAudit({
      actor: state.user?.email ?? "system",
      role: state.user?.role ?? "Super Admin",
      action: "RESET_USER_ACCESS",
      detail: `Reset hak akses pengguna ${u.name} ke preset role ${u.role}.`,
    });
  },

  updateUserPermissions(id: string, permissions: PermissionKey[]) {
    const u = state.users.find((x) => x.id === id);
    if (!u) return;
    setState((s) => ({
      users: s.users.map((x) => (x.id === id ? { ...x, permissions } : x)),
    }));
    pushAudit({
      actor: state.user?.email ?? "system",
      role: state.user?.role ?? "Super Admin",
      action: "UPDATE_USER_PERMISSION",
      detail: `Memperbarui hak akses pengguna ${u.name} (${permissions.length} menu).`,
    });
  },

  updateRolePermissions(roleId: string, patch: { name?: RoleName; description?: string; permissions: PermissionKey[] }) {
    const r = state.roles.find((x) => x.id === roleId);
    if (!r) return;
    const newName = patch.name && !r.isSystem ? patch.name : r.name;
    setState((s) => ({
      roles: s.roles.map((x) =>
        x.id === roleId
          ? { ...x, name: newName, ...(patch.description !== undefined ? { description: patch.description } : {}), permissions: patch.permissions }
          : x,
      ),
      // Cascade rename ke pengguna yang memakai role lama.
      users: r.name !== newName ? s.users.map((u) => (u.role === r.name ? { ...u, role: newName } : u)) : s.users,
    }));
    pushAudit({
      actor: state.user?.email ?? "system",
      role: state.user?.role ?? "Super Admin",
      action: "UPDATE_ROLE_PERMISSION",
      detail: `Memperbarui hak akses role ${newName} (${patch.permissions.length} menu).`,
    });
  },

  createRole(input: { name: RoleName; description: string; permissions: PermissionKey[] }): RoleDef {
    const role: RoleDef = {
      id: "role-" + Math.random().toString(36).slice(2, 10),
      name: input.name,
      description: input.description,
      permissions: input.permissions,
    };
    setState((s) => ({ roles: [...s.roles, role] }));
    pushAudit({
      actor: state.user?.email ?? "system",
      role: state.user?.role ?? "Super Admin",
      action: "CREATE_ROLE_PERMISSION",
      detail: `Menambahkan hak akses ${role.name} (${role.permissions.length} menu).`,
    });
    return role;
  },

  /** Hapus role custom. Role sistem tidak dapat dihapus. Return true bila berhasil. */
  deleteRole(roleId: string): boolean {
    const r = state.roles.find((x) => x.id === roleId);
    if (!r || r.isSystem) return false;
    setState((s) => ({ roles: s.roles.filter((x) => x.id !== roleId) }));
    pushAudit({
      actor: state.user?.email ?? "system",
      role: state.user?.role ?? "Super Admin",
      action: "DELETE_ROLE_PERMISSION",
      detail: `Menghapus hak akses ${r.name}.`,
    });
    return true;
  },

  deleteUser(id: string) {
    const u = state.users.find((x) => x.id === id);
    if (!u) return;
    setState((s) => ({ users: s.users.filter((x) => x.id !== id) }));
    pushAudit({
      actor: state.user?.email ?? "system",
      role: state.user?.role ?? "Super Admin",
      action: "DELETE_USER",
      detail: `Menghapus pengguna ${u.name} (${u.email}).`,
    });
  },
};
