// ============================================================
// Domain types
// ============================================================
export type TipeOrg =
  | "PW"
  | "PC"
  | "MWC"
  | "Lembaga PW"
  | "Lembaga PC"
  | "Ranting";

export type Status = "Pending" | "Approved" | "PerluPerbaikan" | "RejectedFinal";

export type RejectionCategory =
  | "SURAT_SALAH"
  | "SURAT_TIDAK_TERBACA"
  | "SURAT_TIDAK_SESUAI_NAMA"
  | "DATA_ADMIN"
  | "NIK_HP_EMAIL"
  | "KEWENANGAN"
  | "LAINNYA";

export const REJECTION_CATEGORY_LABEL: Record<RejectionCategory, string> = {
  SURAT_SALAH: "Surat tugas salah",
  SURAT_TIDAK_TERBACA: "Surat tugas tidak terbaca",
  SURAT_TIDAK_SESUAI_NAMA: "Surat tugas tidak sesuai nama organisasi",
  DATA_ADMIN: "Data administrator tidak sesuai",
  NIK_HP_EMAIL: "NIK / nomor HP / email perlu diperbaiki",
  KEWENANGAN: "Kewenangan pendaftar tidak sesuai",
  LAINNYA: "Lainnya",
};

/** Kategori yang mewajibkan upload surat tugas baru saat revisi. */
export const SURAT_TUGAS_CATEGORIES: RejectionCategory[] = [
  "SURAT_SALAH",
  "SURAT_TIDAK_TERBACA",
  "SURAT_TIDAK_SESUAI_NAMA",
];

export interface RevisionRequestEntry {
  at: string;
  reviewer: string;
  decision: "PerluPerbaikan" | "RejectedFinal";
  category: RejectionCategory;
  note: string;
}

export interface ResubmitEntry {
  at: string;
  by: string;
  changedFields: string[];
  previous: {
    namaAdmin: string;
    jabatan: string;
    nik: string;
    hp: string;
    email: string;
    sumberSuratTugas: SumberSuratTugas;
    suratTugasFile?: string;
    dokumenSistem?: DokumenSistem;
  };
}

/** Legacy "jalur": A = publik via kode akses, B = internal dashboard. */
export type Jalur = "A" | "B";

export type AccessCodeStatus = "Unused" | "Used" | "Expired" | "Disabled";
export type Tingkat = "PW" | "PC";

export type StatusOrg = "Belum Production" | "Pending Aktivasi" | "Production";

export type SumberPengajuan = "PUBLIC" | "PW_DASHBOARD" | "PC_DASHBOARD";
export type SumberSuratTugas = "DIGDAYA_PERSURATAN" | "MANUAL_UPLOAD";

// ============================================================
// Master Data
// ============================================================
export interface MasterPW {
  id: string;
  nama: string;
  wilayah: string;
  statusOrg: StatusOrg;
}

export interface MasterPC {
  id: string;
  nama: string;
  pw: string;
  pwId: string;
  statusOrg: StatusOrg;
  /** alias for statusOrg === "Production" (backward compat) */
  aktif: boolean;
}

export interface MasterMWC {
  id: string;
  nama: string;
  pcId: string;
}

export interface MasterLembaga {
  id: string;
  nama: string;
  pcId?: string;
  pwId?: string;
}

export type AccessCodeKind = "Individual" | "Scoped";

export interface AccessCodeScope {
  /** "Nasional" or specific PW id (e.g. "pw-jogja") */
  wilayahPwId: string | "Nasional";
  mode: "auto" | "whitelist";
  whitelist?: string[];
}

export interface AccessCode {
  code: string;
  tingkat: Tingkat;
  /** Individual codes: target PC/PW id. Scoped codes: empty string (orgs are picked later). */
  orgId: string;
  orgName: string;
  /** wilayah / PW name for display */
  pw: string;
  status: AccessCodeStatus;
  generatedAt: string;
  expiredAt: string;
  usedAt?: string;
  ticketId?: string;
  /** "Scoped" = batch code that lets pendaftar pick org from filtered master list. */
  kind?: AccessCodeKind;
  /** Human-readable batch name for Scoped codes. */
  batchName?: string;
  /** Scope filter for Scoped codes. */
  scope?: AccessCodeScope;
  // legacy alias for older code that still uses .pcId / .pcName
  pcId?: string;
  pcName?: string;
}

export interface DokumenSistem {
  documentId: string;
  /** Optional UUID-style Letter ID dari Digdaya Persuratan. */
  letterId?: string;
  nomorSurat: string;
  namaDokumen: string;
  tanggalSurat: string; // ISO date
  penandatangan: string;
  status: string; // e.g. "Tertandatangani"
  /** Mock PDF preview URL. */
  pdfUrl?: string;
}

export type AdministratorType = "Pengurus" | "Staf";

export interface Registration {
  ticketId: string;
  jalur: Jalur;
  sumberPengajuan: SumberPengajuan;
  tingkatPendaftar: Tingkat;
  tipeOrg: TipeOrg;
  namaOrg: string;
  pw: string;

  // Jalur A
  accessCode?: string;
  /** Untuk Scoped batch code: organisasi yang dipilih pendaftar dari daftar scope.
   *  Untuk Ranting: id Ranting yang baru dibuat. */
  selectedOrgId?: string;

  // Ranting-only fields
  parentMwcId?: string;
  parentMwcName?: string;
  village?: string;
  locationNote?: string;

  // Jalur B / Internal source
  sourcePcId?: string;
  sourcePcName?: string;
  sourcePwId?: string;
  sourcePwName?: string;

  // Administrator
  namaAdmin: string;
  jabatan: string;
  /** "Pengurus" | "Staf" — optional untuk backward-compat dengan seed lama. */
  administratorType?: AdministratorType;
  nik: string;
  hp: string;
  email: string;

  // Surat Tugas
  sumberSuratTugas: SumberSuratTugas;
  suratTugasFile?: string;
  dokumenSistem?: DokumenSistem;

  status: Status;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectReason?: string;
  rejectionCategory?: RejectionCategory;
  revisionCount?: number;
  revisionHistory?: RevisionRequestEntry[];
  resubmitHistory?: ResubmitEntry[];
  peruriBatchId?: string;

  // Ranting management ID (Super Admin generates after approval)
  idManagementStatus?: "Belum Dibuat" | "ID Terbuat" | "Siap Aktivasi Sistem" | "Aktif di Digdaya";
  managementId?: string;
  managementGeneratedAt?: string;
  managementGeneratedBy?: string;
  activatedSystems?: Array<"Digdaya Kepengurusan" | "Digdaya Persuratan">;
}

export interface PeruriBatch {
  id: string;
  date: string;
  generatedAt: string;
  count: number;
  countA: number;
  countB: number;
  status: "Ready" | "Downloaded";
  downloadedBy?: string;
  ticketIds: string[];
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  ticketId?: string;
  detail: string;
}

// ============================================================
// Master Data — seeds
// ============================================================
export const masterPW: MasterPW[] = [
  { id: "pw-jogja",  nama: "PWNU DI Yogyakarta", wilayah: "DI Yogyakarta", statusOrg: "Production" },
  { id: "pw-jateng", nama: "PWNU Jawa Tengah",   wilayah: "Jawa Tengah",   statusOrg: "Production" },
  { id: "pw-jatim",  nama: "PWNU Jawa Timur",    wilayah: "Jawa Timur",    statusOrg: "Belum Production" },
  { id: "pw-jabar",  nama: "PWNU Jawa Barat",    wilayah: "Jawa Barat",    statusOrg: "Belum Production" },
  { id: "pw-banten", nama: "PWNU Banten",        wilayah: "Banten",        statusOrg: "Belum Production" },
  { id: "pw-kaltara",    nama: "PWNU Kalimantan Utara", wilayah: "Kalimantan Utara", statusOrg: "Belum Production" },
  { id: "pw-papuabarat", nama: "PWNU Papua Barat",      wilayah: "Papua Barat",      statusOrg: "Belum Production" },
  { id: "pw-sulbar",     nama: "PWNU Sulawesi Barat",   wilayah: "Sulawesi Barat",   statusOrg: "Belum Production" },
];

export const masterPC: MasterPC[] = [
  { id: "pc-jogja",   nama: "PCNU Kota Yogyakarta",    pw: "PWNU DI Yogyakarta", pwId: "pw-jogja",  statusOrg: "Belum Production", aktif: false },
  { id: "pc-sleman",  nama: "PCNU Kabupaten Sleman",   pw: "PWNU DI Yogyakarta", pwId: "pw-jogja",  statusOrg: "Production",       aktif: true  },
  { id: "pc-bantul",  nama: "PCNU Bantul",             pw: "PWNU DI Yogyakarta", pwId: "pw-jogja",  statusOrg: "Belum Production", aktif: false },
  { id: "pc-kp",      nama: "PCNU Kulon Progo",        pw: "PWNU DI Yogyakarta", pwId: "pw-jogja",  statusOrg: "Belum Production", aktif: false },
  { id: "pc-gk",      nama: "PCNU Gunungkidul",        pw: "PWNU DI Yogyakarta", pwId: "pw-jogja",  statusOrg: "Belum Production", aktif: false },
  { id: "pc-solo",    nama: "PCNU Kota Surakarta",     pw: "PWNU Jawa Tengah",   pwId: "pw-jateng", statusOrg: "Production",       aktif: true  },
  { id: "pc-klaten",  nama: "PCNU Kabupaten Klaten",   pw: "PWNU Jawa Tengah",   pwId: "pw-jateng", statusOrg: "Belum Production", aktif: false },
  { id: "pc-mgl",     nama: "PCNU Kabupaten Magelang", pw: "PWNU Jawa Tengah",   pwId: "pw-jateng", statusOrg: "Belum Production", aktif: false },
  { id: "pc-bms",     nama: "PCNU Kabupaten Banyumas", pw: "PWNU Jawa Tengah",   pwId: "pw-jateng", statusOrg: "Belum Production", aktif: false },
  { id: "pc-jbg",     nama: "PCNU Kabupaten Jombang",  pw: "PWNU Jawa Timur",    pwId: "pw-jatim",  statusOrg: "Production",       aktif: true  },
];

export const masterMWC: MasterMWC[] = [
  { id: "mwc-depok",   nama: "MWCNU Depok",   pcId: "pc-sleman" },
  { id: "mwc-gamping", nama: "MWCNU Gamping", pcId: "pc-sleman" },
  { id: "mwc-mlati",   nama: "MWCNU Mlati",   pcId: "pc-sleman" },
  { id: "mwc-ngaglik", nama: "MWCNU Ngaglik", pcId: "pc-sleman" },
  { id: "mwc-godean",  nama: "MWCNU Godean",  pcId: "pc-sleman" },
];

export const masterLembaga: MasterLembaga[] = [
  { id: "lpc-maarif", nama: "LP Ma'arif PCNU Sleman", pcId: "pc-sleman" },
  { id: "lpc-lazis",  nama: "LAZISNU PCNU Sleman",    pcId: "pc-sleman" },
  { id: "lpc-rmi",    nama: "RMINU PCNU Sleman",      pcId: "pc-sleman" },
  { id: "lpc-ldnu",   nama: "LDNU PCNU Sleman",       pcId: "pc-sleman" },
  { id: "lpw-maarif", nama: "LP Ma'arif PWNU DIY",    pwId: "pw-jogja" },
  { id: "lpw-rmi",    nama: "RMINU PWNU DIY",         pwId: "pw-jogja" },
];

// Demo internal users
export const demoPcUserPcId = "pc-sleman";
export const demoPwUserPwId = "pw-jogja";

// ============================================================
// Surat Tugas Digdaya Persuratan (mock)
// ============================================================
const isoDate = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const mockSuratTugasDigdaya: DokumenSistem[] = [
  { documentId: "DOC-2026-0101", nomorSurat: "001/PC-SLM/ST/2026", namaDokumen: "Surat Tugas Aktivasi Administrator MWCNU Mlati", tanggalSurat: isoDate(2),  penandatangan: "KH. Ahmad Mustofa (Ketua PCNU Sleman)",         status: "Tertandatangani" },
  { documentId: "DOC-2026-0102", nomorSurat: "002/PC-SLM/ST/2026", namaDokumen: "Surat Tugas Pengangkatan Pengurus LAZISNU Sleman", tanggalSurat: isoDate(4),  penandatangan: "KH. Ahmad Mustofa (Ketua PCNU Sleman)",         status: "Tertandatangani" },
  { documentId: "DOC-2026-0103", nomorSurat: "003/PC-SLM/ST/2026", namaDokumen: "Surat Tugas Administrator Ranting NU Ambarketawang", tanggalSurat: isoDate(6),  penandatangan: "KH. Ahmad Mustofa (Ketua PCNU Sleman)",       status: "Tertandatangani" },
  { documentId: "DOC-2026-0104", nomorSurat: "004/PC-SLM/ST/2026", namaDokumen: "Surat Tugas Administrator MWCNU Ngaglik",          tanggalSurat: isoDate(7),  penandatangan: "KH. Ahmad Mustofa (Ketua PCNU Sleman)",         status: "Tertandatangani" },
  { documentId: "DOC-2026-0105", nomorSurat: "005/PC-SLM/ST/2026", namaDokumen: "Surat Tugas Pengurus RMINU PCNU Sleman",          tanggalSurat: isoDate(10), penandatangan: "KH. Ahmad Mustofa (Ketua PCNU Sleman)",         status: "Tertandatangani" },
  { documentId: "DOC-2026-0201", nomorSurat: "010/PW-DIY/ST/2026", namaDokumen: "Surat Tugas Aktivasi Administrator PCNU Bantul",   tanggalSurat: isoDate(3),  penandatangan: "KH. Hilmy Muhammad (Rais PWNU DIY)",            status: "Tertandatangani" },
  { documentId: "DOC-2026-0202", nomorSurat: "011/PW-DIY/ST/2026", namaDokumen: "Surat Tugas Pengangkatan Pengurus LP Ma'arif PWNU DIY", tanggalSurat: isoDate(5),  penandatangan: "KH. Hilmy Muhammad (Rais PWNU DIY)",       status: "Tertandatangani" },
  { documentId: "DOC-2026-0301", nomorSurat: "020/PC-JBG/ST/2026", namaDokumen: "Surat Tugas Administrator MWCNU Diwek",            tanggalSurat: isoDate(4),  penandatangan: "KH. Anwar Manshur (Ketua PCNU Jombang)",        status: "Tertandatangani" },
  { documentId: "DOC-2026-0302", nomorSurat: "021/PC-JBG/ST/2026", namaDokumen: "Surat Tugas Pengurus Ranting NU Cukir",            tanggalSurat: isoDate(3),  penandatangan: "KH. Anwar Manshur (Ketua PCNU Jombang)",        status: "Tertandatangani" },
  { documentId: "DOC-2026-0401", nomorSurat: "030/PC-SLO/ST/2026", namaDokumen: "Surat Tugas Pengurus LP Ma'arif PCNU Surakarta",   tanggalSurat: isoDate(1),  penandatangan: "KH. Mu'inudinillah (Ketua PCNU Surakarta)",     status: "Tertandatangani" },
  { documentId: "DOC-2026-0203", nomorSurat: "201/PW.01/A.I.06.03/05/2026", namaDokumen: "Surat Tugas Aktivasi PCNU Kota Yogyakarta", tanggalSurat: isoDate(3), penandatangan: "KH. Hilmy Muhammad (Rais PWNU DIY)", status: "Tertandatangani" },
  { documentId: "DOC-2026-0501", nomorSurat: "125/PC.13/A.I.06.03/05/2026", namaDokumen: "Surat Tugas Aktivasi MWCNU Banyuanyar", tanggalSurat: isoDate(1), penandatangan: "Ketua dan Sekretaris PCNU Kraksaan", status: "Tertandatangani" },

  // Letter ID format (UUID) — referenced from new SuratTugasSelector demo
  { documentId: "DOC-PBNU-001", letterId: "a53f57ba-a0f8-478d-a44c-8a19f6d9b7a3", nomorSurat: "332/PB.01/A.II.06.03/99/05/2026", namaDokumen: "Surat Tugas Tim Survei Lokasi Munas dan Konbes 2026", tanggalSurat: isoDate(6),  penandatangan: "Ketua dan Sekretaris", status: "Terkirim / Terstempel", pdfUrl: "mock-pdf-url-1" },
  { documentId: "DOC-PBNU-002", letterId: "66b8ef82-b77c-46db-a797-e3fbef3d3afc", nomorSurat: "347/PB.23/B.I.03.08/99/05/2026", namaDokumen: "Letter of Support for Italian Visa Application",       tanggalSurat: isoDate(1),  penandatangan: "Sekretariat PBNU",      status: "Terkirim / Terstempel", pdfUrl: "mock-pdf-url-2" },
  { documentId: "DOC-PC-KRK-201", nomorSurat: "201/PC.13/A.I.06.03/05/2026", namaDokumen: "Surat Tugas Aktivasi MWCNU Banyuanyar",        tanggalSurat: isoDate(8),  penandatangan: "Ketua dan Sekretaris PCNU Kraksaan", status: "Terkirim / Terstempel", pdfUrl: "mock-pdf-url-3" },
  { documentId: "DOC-PC-KRK-202", nomorSurat: "202/PC.13/A.I.06.03/05/2026", namaDokumen: "Surat Tugas Aktivasi Ranting NU Banyuanyar Tengah", tanggalSurat: isoDate(7), penandatangan: "Ketua dan Sekretaris PCNU Kraksaan", status: "Terkirim / Terstempel", pdfUrl: "mock-pdf-url-4" },
];

// ============================================================
// Helpers
// ============================================================
const daysAgo = (n: number, hour = 9) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

function pcMeta(pcId: string) {
  const pc = masterPC.find((p) => p.id === pcId)!;
  return { orgId: pc.id, orgName: pc.nama, pw: pc.pw, pcId: pc.id, pcName: pc.nama };
}

// ============================================================
// Access Codes (only for organisasi yang BELUM Production)
// ============================================================
export const seedAccessCodes: AccessCode[] = [
  // historical Used (organisasi sudah jadi production setelah approved)
  { code: "DGD-7K2M-9XQA", tingkat: "PC", ...pcMeta("pc-jogja"),  status: "Used",     generatedAt: daysAgo(20), expiredAt: daysFromNow(10), usedAt: daysAgo(5),  ticketId: "AKT-2026-000101" },
  { code: "DGD-PL3X-22BV", tingkat: "PC", ...pcMeta("pc-sleman"), status: "Used",     generatedAt: daysAgo(25), expiredAt: daysFromNow(5),  usedAt: daysAgo(12), ticketId: "AKT-2026-000102" },
  { code: "DGD-9HM2-AB7K", tingkat: "PC", ...pcMeta("pc-solo"),   status: "Used",     generatedAt: daysAgo(18), expiredAt: daysFromNow(12), usedAt: daysAgo(3),  ticketId: "AKT-2026-000108" },
  { code: "DGD-X4Q1-77ZD", tingkat: "PC", ...pcMeta("pc-jbg"),    status: "Used",     generatedAt: daysAgo(15), expiredAt: daysFromNow(15), usedAt: daysAgo(6),  ticketId: "AKT-2026-000112" },

  // Aktif untuk PC belum production
  { code: "DGD-MN8P-3KLR", kind: "Scoped", batchName: "Onboarding PW Nasional Batch 1", tingkat: "PW", orgId: "", orgName: "Onboarding PW Nasional Batch 1", pw: "Nasional", scope: { wilayahPwId: "Nasional", mode: "auto" }, status: "Unused", generatedAt: daysAgo(0), expiredAt: daysFromNow(30) },
  { code: "DGD-2C7J-BVQK", tingkat: "PC", ...pcMeta("pc-kp"),     status: "Unused",   generatedAt: daysAgo(5),  expiredAt: daysFromNow(25) },
  { code: "DGD-T5Z9-MWPE", tingkat: "PC", ...pcMeta("pc-gk"),     status: "Unused",   generatedAt: daysAgo(7),  expiredAt: daysFromNow(23) },
  { code: "DGD-AB12-CDEF", tingkat: "PC", ...pcMeta("pc-klaten"), status: "Unused",   generatedAt: daysAgo(3),  expiredAt: daysFromNow(27) },
  { code: "DGD-GH34-JKLM", tingkat: "PC", ...pcMeta("pc-mgl"),    status: "Unused",   generatedAt: daysAgo(3),  expiredAt: daysFromNow(27) },
  { code: "DGD-NP56-QRST", tingkat: "PC", ...pcMeta("pc-bms"),    status: "Unused",   generatedAt: daysAgo(2),  expiredAt: daysFromNow(28) },

  // Aktif untuk PW belum production
  { code: "DGD-PW01-JTIM", tingkat: "PW", orgId: "pw-jatim",  orgName: "PWNU Jawa Timur",  pw: "PWNU Jawa Timur",  status: "Unused", generatedAt: daysAgo(2), expiredAt: daysFromNow(28) },
  { code: "DGD-PW02-JBAR", tingkat: "PW", orgId: "pw-jabar",  orgName: "PWNU Jawa Barat",  pw: "PWNU Jawa Barat",  status: "Unused", generatedAt: daysAgo(1), expiredAt: daysFromNow(29) },
  { code: "DGD-PW03-BTEN", tingkat: "PW", orgId: "pw-banten", orgName: "PWNU Banten",      pw: "PWNU Banten",      status: "Unused", generatedAt: daysAgo(0), expiredAt: daysFromNow(30) },

  { code: "DGD-OLD1-EXPR", tingkat: "PC", ...pcMeta("pc-bantul"), status: "Expired",  generatedAt: daysAgo(60), expiredAt: daysAgo(30) },
  { code: "DGD-DIS1-ABCD", tingkat: "PC", ...pcMeta("pc-gk"),     status: "Disabled", generatedAt: daysAgo(10), expiredAt: daysFromNow(20) },

  // ===== Demo codes (mudah diingat untuk demo end-to-end) =====
  { code: "AKSES-PC-001",   tingkat: "PC", ...pcMeta("pc-jogja"), status: "Unused",   generatedAt: daysAgo(1), expiredAt: daysFromNow(30) },
  { code: "AKSES-PW-001",   tingkat: "PW", orgId: "pw-kaltara", orgName: "PWNU Kalimantan Utara", pw: "PWNU Kalimantan Utara", status: "Unused", generatedAt: daysAgo(1), expiredAt: daysFromNow(30) },
  { code: "AKSES-EXP-001",  tingkat: "PC", ...pcMeta("pc-kp"),    status: "Expired",  generatedAt: daysAgo(60), expiredAt: daysAgo(15) },
  { code: "AKSES-DIS-001",  tingkat: "PC", ...pcMeta("pc-bantul"),status: "Disabled", generatedAt: daysAgo(10), expiredAt: daysFromNow(20) },
  { code: "AKSES-USED-001", tingkat: "PC", ...pcMeta("pc-mgl"),   status: "Used",     generatedAt: daysAgo(20), expiredAt: daysFromNow(10), usedAt: daysAgo(2), ticketId: "AKT-2026-000102" },

  // ===== Scoped Batch Codes — pendaftar memilih organisasi sendiri dari daftar scope =====
  {
    code: "ONBOARD-PC-DIY-MEI2026",
    kind: "Scoped",
    batchName: "Onboarding PC DIY Mei 2026",
    tingkat: "PC",
    orgId: "",
    orgName: "Onboarding PC DIY Mei 2026",
    pw: "PWNU DI Yogyakarta",
    scope: { wilayahPwId: "pw-jogja", mode: "auto" },
    status: "Unused",
    generatedAt: daysAgo(2),
    expiredAt: daysFromNow(28),
  },
  {
    code: "ONBOARD-PC-JATENG-01",
    kind: "Scoped",
    batchName: "Onboarding PC Jawa Tengah Batch 1",
    tingkat: "PC",
    orgId: "",
    orgName: "Onboarding PC Jawa Tengah Batch 1",
    pw: "PWNU Jawa Tengah",
    scope: { wilayahPwId: "pw-jateng", mode: "auto" },
    status: "Unused",
    generatedAt: daysAgo(2),
    expiredAt: daysFromNow(28),
  },
  {
    code: "ONBOARD-PW-NASIONAL",
    kind: "Scoped",
    batchName: "Onboarding PW Nasional",
    tingkat: "PW",
    orgId: "",
    orgName: "Onboarding PW Nasional",
    pw: "Nasional",
    scope: { wilayahPwId: "Nasional", mode: "auto" },
    status: "Unused",
    generatedAt: daysAgo(1),
    expiredAt: daysFromNow(29),
  },
];

// ============================================================
// Registrations (seed)
// ============================================================
type R = Registration;

function regJalurA(o: Partial<R> & Pick<R, "ticketId" | "namaOrg" | "pw" | "accessCode" | "namaAdmin" | "jabatan" | "nik" | "hp" | "email" | "status" | "submittedAt">): R {
  return {
    jalur: "A",
    sumberPengajuan: "PUBLIC",
    tingkatPendaftar: "PC",
    tipeOrg: "PC",
    sumberSuratTugas: "MANUAL_UPLOAD",
    suratTugasFile: "surat-tugas-pengangkatan.pdf",
    ...o,
  } as R;
}

function regJalurB(o: Partial<R> & Pick<R, "ticketId" | "tipeOrg" | "namaOrg" | "pw" | "sourcePcId" | "sourcePcName" | "namaAdmin" | "jabatan" | "nik" | "hp" | "email" | "status" | "submittedAt">): R {
  return {
    jalur: "B",
    sumberPengajuan: "PC_DASHBOARD",
    tingkatPendaftar: "PC",
    sumberSuratTugas: "MANUAL_UPLOAD",
    suratTugasFile: "surat-tugas.pdf",
    ...o,
  } as R;
}

export const seedRegistrations: Registration[] = [
  regJalurA({ ticketId: "AKT-2026-000101", namaOrg: "PCNU Kota Yogyakarta",   pw: "PWNU DI Yogyakarta", accessCode: "DGD-7K2M-9XQA", namaAdmin: "Ahmad Fauzi",       jabatan: "Sekretaris", nik: "3471010101900001", hp: "+6281234567001", email: "fauzi@pcnu-jogja.id",     status: "Approved", submittedAt: daysAgo(5), reviewedAt: daysAgo(4), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" }),
  regJalurA({ ticketId: "AKT-2026-000102", namaOrg: "PCNU Kabupaten Sleman",  pw: "PWNU DI Yogyakarta", accessCode: "DGD-PL3X-22BV", namaAdmin: "Muhammad Hidayat",  jabatan: "Ketua",      nik: "3404020202800002", hp: "+6281234567002", email: "hidayat@pcnu-sleman.id",  status: "Approved", submittedAt: daysAgo(12), reviewedAt: daysAgo(11), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" }),
  regJalurA({ ticketId: "AKT-2026-000108", namaOrg: "PCNU Kota Surakarta",    pw: "PWNU Jawa Tengah",   accessCode: "DGD-9HM2-AB7K", namaAdmin: "Hadi Pranoto",      jabatan: "Ketua",      nik: "3374080808820008", hp: "+6281234567008", email: "hadi@pcnu-solo.id",       status: "Approved", submittedAt: daysAgo(3), reviewedAt: daysAgo(2), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" }),
  regJalurA({ ticketId: "AKT-2026-000112", namaOrg: "PCNU Kabupaten Jombang", pw: "PWNU Jawa Timur",    accessCode: "DGD-X4Q1-77ZD", namaAdmin: "Khairul Anwar",     jabatan: "Ketua",      nik: "3578121212840012", hp: "+6281234567012", email: "khairul@pcnu-jombang.id", status: "Approved", submittedAt: daysAgo(6), reviewedAt: daysAgo(5), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" }),
  regJalurA({ ticketId: "AKT-2026-000121", namaOrg: "PCNU Kabupaten Klaten",  pw: "PWNU Jawa Tengah",   accessCode: "DGD-AB12-CDEF", namaAdmin: "Imam Subekti",      jabatan: "Sekretaris", nik: "3374090909860009", hp: "+6281234567009", email: "imam@pcnu-klaten.id",     status: "Pending", submittedAt: daysAgo(0, 8) }),
  regJalurB({ ticketId: "AKT-2026-000122", tipeOrg: "MWC", namaOrg: "MWCNU Banyuanyar", pw: "PWNU Jawa Timur", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kraksaan", namaAdmin: "Ahmad Subhan", jabatan: "Sekretaris", nik: "3507000000001220", hp: "+6281234500122", email: "ahmad.subhan@example.com", status: "Pending", submittedAt: "2026-05-28T03:15:00.000Z",
    sumberSuratTugas: "DIGDAYA_PERSURATAN", suratTugasFile: undefined,
    dokumenSistem: mockSuratTugasDigdaya[mockSuratTugasDigdaya.length - 1],
  }),
  regJalurA({ ticketId: "AKT-2026-000126", namaOrg: "PCNU Kabupaten Banyumas",pw: "PWNU Jawa Tengah",   accessCode: "DGD-NP56-QRST", namaAdmin: "Salman Alfarisi",   jabatan: "Ketua",      nik: "3302222222880011", hp: "+6281234567011", email: "salman@pcnu-bms.id",      status: "Pending", submittedAt: daysAgo(2, 10) }),
  regJalurA({ ticketId: "AKT-2026-000123", namaOrg: "PCNU Gunungkidul",       pw: "PWNU DI Yogyakarta", accessCode: "DGD-T5Z9-MWPE", namaAdmin: "Yusuf Mansur",      jabatan: "Sekretaris", nik: "3403030303850016", hp: "+6281234567016", email: "yusuf@pcnu-gk.id",        status: "PerluPerbaikan", submittedAt: daysAgo(4), reviewedAt: daysAgo(3), reviewedBy: "reviewer@digdaya.nu.id", rejectReason: "Scan surat tugas tidak terbaca. Mohon upload ulang dengan kualitas lebih jelas.", rejectionCategory: "SURAT_TIDAK_TERBACA", revisionCount: 0, revisionHistory: [{ at: daysAgo(3), reviewer: "reviewer@digdaya.nu.id", decision: "PerluPerbaikan", category: "SURAT_TIDAK_TERBACA", note: "Scan surat tugas tidak terbaca. Mohon upload ulang dengan kualitas lebih jelas." }] }),

  // Jalur B — PCNU Sleman mendaftarkan MWC, Lembaga, Ranting (campuran sumber surat tugas)
  regJalurB({ ticketId: "AKT-2026-000103", tipeOrg: "MWC", namaOrg: "MWCNU Depok", pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Siti Aminah",  jabatan: "Bendahara", nik: "3404030303850003", hp: "+6281234567003", email: "aminah@mwc-depok.id",   status: "Approved", submittedAt: daysAgo(5), reviewedAt: daysAgo(4), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" }),
  regJalurB({ ticketId: "AKT-2026-000124", tipeOrg: "MWC", namaOrg: "MWCNU Mlati",     pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Hasan Basri",  jabatan: "Ketua",     nik: "3404202020830020", hp: "+6281234567020", email: "hasan@mwc-mlati.id", status: "Pending", submittedAt: daysAgo(1, 13),
    sumberSuratTugas: "DIGDAYA_PERSURATAN", suratTugasFile: undefined,
    dokumenSistem: mockSuratTugasDigdaya[0],
  }),
  regJalurB({ ticketId: "AKT-2026-000125", tipeOrg: "MWC", namaOrg: "MWCNU Banyuanyar", pw: "PWNU Jawa Timur", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kraksaan", namaAdmin: "Ahmad Subhan", jabatan: "Sekretaris", nik: "3507000000001250", hp: "+6281234500125", email: "ahmad.subhan@example.com", status: "Pending", submittedAt: "2026-05-23T02:30:00.000Z",
    sumberSuratTugas: "DIGDAYA_PERSURATAN", suratTugasFile: undefined,
    dokumenSistem: mockSuratTugasDigdaya[mockSuratTugasDigdaya.length - 1],
  }),
  // Jalur B — Ranting di bawah PCNU Kraksaan (input manual oleh PC)
  { jalur: "B", sumberPengajuan: "PC_DASHBOARD", tingkatPendaftar: "PC", ticketId: "AKT-2026-000150", tipeOrg: "Ranting",
    namaOrg: "Ranting NU Banyuanyar Tengah", pw: "PWNU Jawa Timur",
    sourcePcId: "pc-sleman", sourcePcName: "PCNU Kraksaan",
    selectedOrgId: "ranting-banyuanyar-tengah",
    parentMwcId: "mwc-banyuanyar", parentMwcName: "MWCNU Banyuanyar", village: "Banyuanyar Tengah",
    namaAdmin: "Imron Hadi", jabatan: "Sekretaris", nik: "3513150000000150", hp: "+6281234500150", email: "imron@example.com",
    sumberSuratTugas: "DIGDAYA_PERSURATAN", dokumenSistem: mockSuratTugasDigdaya[mockSuratTugasDigdaya.length - 1],
    status: "Approved", submittedAt: daysAgo(2, 10), reviewedAt: daysAgo(1, 14), reviewedBy: "reviewer@digdaya.nu.id" } as Registration,
  { jalur: "B", sumberPengajuan: "PC_DASHBOARD", tingkatPendaftar: "PC", ticketId: "AKT-2026-000153", tipeOrg: "Ranting",
    namaOrg: "Ranting NU Gading Wetan Aktif", pw: "PWNU Jawa Timur",
    sourcePcId: "pc-sleman", sourcePcName: "PCNU Kraksaan",
    selectedOrgId: "ranting-gading-wetan-aktif",
    parentMwcId: "mwc-gading", parentMwcName: "MWCNU Gading", village: "Gading Wetan",
    namaAdmin: "Siti Aminah", jabatan: "Sekretaris", nik: "3513150000000153", hp: "+6281234500135", email: "siti.aminah@example.com",
    sumberSuratTugas: "DIGDAYA_PERSURATAN", dokumenSistem: mockSuratTugasDigdaya[mockSuratTugasDigdaya.length - 1],
    status: "Approved", submittedAt: daysAgo(1, 9), reviewedAt: daysAgo(0, 12), reviewedBy: "reviewer@digdaya.nu.id",
    idManagementStatus: "Aktif di Digdaya", managementId: "NU-RTG-2026-000002",
    managementGeneratedAt: daysAgo(0, 13), managementGeneratedBy: "admin@digdaya.nu.id",
    activatedSystems: ["Digdaya Kepengurusan", "Digdaya Persuratan"] } as Registration,
  { jalur: "B", sumberPengajuan: "PC_DASHBOARD", tingkatPendaftar: "PC", ticketId: "AKT-2026-000140", tipeOrg: "Ranting",
    namaOrg: "Ranting NU Mlati Lor", pw: "PWNU DI Yogyakarta",
    sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman",
    selectedOrgId: "ranting-mlati-lor",
    parentMwcId: "mwc-mlati", parentMwcName: "MWCNU Mlati", village: "Mlati Lor",
    namaAdmin: "Hasan Basri", jabatan: "Ketua", nik: "3404140000000140", hp: "+6281234500140", email: "hasan.basri@example.com",
    sumberSuratTugas: "MANUAL_UPLOAD", suratTugasFile: "surat-tugas-mlati-lor.pdf",
    status: "Approved", submittedAt: daysAgo(1, 8), reviewedAt: daysAgo(0, 10), reviewedBy: "reviewer@digdaya.nu.id" } as Registration,
  { jalur: "B", sumberPengajuan: "PC_DASHBOARD", tingkatPendaftar: "PC", ticketId: "AKT-2026-000151", tipeOrg: "Ranting",
    namaOrg: "Ranting NU Gading Wetan", pw: "PWNU Jawa Timur",
    sourcePcId: "pc-sleman", sourcePcName: "PCNU Kraksaan",
    selectedOrgId: "ranting-gading-wetan",
    parentMwcId: "mwc-gading", parentMwcName: "MWCNU Gading", village: "Gading Wetan",
    namaAdmin: "Siti Maryam", jabatan: "Bendahara", nik: "3513150000000151", hp: "+6281234500151", email: "siti@example.com",
    sumberSuratTugas: "MANUAL_UPLOAD", suratTugasFile: "surat-tugas-ranting-gading.pdf",
    status: "PerluPerbaikan", submittedAt: daysAgo(4, 9), reviewedAt: daysAgo(3, 14), reviewedBy: "reviewer@digdaya.nu.id",
    rejectReason: "Nama Ranting tidak sesuai dengan surat tugas. Mohon diperbaiki.",
    rejectionCategory: "SURAT_TIDAK_SESUAI_NAMA",
    revisionHistory: [{ at: daysAgo(3, 14), reviewer: "reviewer@digdaya.nu.id", decision: "PerluPerbaikan", category: "SURAT_TIDAK_SESUAI_NAMA", note: "Nama Ranting tidak sesuai dengan surat tugas. Mohon diperbaiki." }],
  } as Registration,
  { jalur: "B", sumberPengajuan: "PC_DASHBOARD", tingkatPendaftar: "PC", ticketId: "AKT-2026-000152", tipeOrg: "Ranting",
    namaOrg: "Ranting NU Paiton Kulon", pw: "PWNU Jawa Timur",
    sourcePcId: "pc-sleman", sourcePcName: "PCNU Kraksaan",
    selectedOrgId: "ranting-paiton-kulon",
    parentMwcId: "mwc-paiton", parentMwcName: "MWCNU Paiton", village: "Paiton Kulon",
    namaAdmin: "Mahmud Yunus", jabatan: "Ketua", nik: "3513150000000152", hp: "+6281234500127", email: "ahmad.subhan@example.com",
    sumberSuratTugas: "DIGDAYA_PERSURATAN", dokumenSistem: mockSuratTugasDigdaya[mockSuratTugasDigdaya.length - 1],
    status: "Approved", submittedAt: daysAgo(8, 9), reviewedAt: daysAgo(7, 14), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001",
    idManagementStatus: "ID Terbuat", managementId: "NU-RTG-2026-000001",
    managementGeneratedAt: daysAgo(6, 10), managementGeneratedBy: "admin@digdaya.nu.id",
    activatedSystems: ["Digdaya Kepengurusan"],
  } as Registration,
  // Duplikasi contoh — Banyuanyar Tengah lagi, MWC sama
  { jalur: "B", sumberPengajuan: "PC_DASHBOARD", tingkatPendaftar: "PC", ticketId: "AKT-2026-000141", tipeOrg: "Ranting",
    namaOrg: "Ranting NU Banyuanyar Tengah", pw: "PWNU Jawa Timur",
    sourcePcId: "pc-sleman", sourcePcName: "PCNU Kraksaan",
    selectedOrgId: "ranting-banyuanyar-tengah-dup",
    parentMwcId: "mwc-banyuanyar", parentMwcName: "MWCNU Banyuanyar", village: "Banyuanyar Tengah",
    namaAdmin: "Hasan Basri", jabatan: "Ketua", nik: "3513150000000141", hp: "+6281234500141", email: "hasan.dup@example.com",
    sumberSuratTugas: "MANUAL_UPLOAD", suratTugasFile: "surat-tugas-dup.pdf",
    status: "Approved", submittedAt: daysAgo(0, 8), reviewedAt: daysAgo(0, 10), reviewedBy: "reviewer@digdaya.nu.id",
  } as Registration,

  regJalurB({ ticketId: "AKT-2026-000127", tipeOrg: "Lembaga PC", namaOrg: "LAZISNU PCNU Sleman", pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Halimah Yusuf", jabatan: "Bendahara", nik: "3404272727870027", hp: "+6281234567027", email: "halimah@lazis-sleman.id", status: "Pending", submittedAt: daysAgo(1),
    sumberSuratTugas: "DIGDAYA_PERSURATAN", suratTugasFile: undefined,
    dokumenSistem: mockSuratTugasDigdaya[1],
  }),
  regJalurB({ ticketId: "AKT-2026-000128", tipeOrg: "Lembaga PC", namaOrg: "RMINU PCNU Sleman",   pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Anisa Putri",   jabatan: "Sekretaris", nik: "3404282828920028", hp: "+6281234567028", email: "anisa@rmi-sleman.id", status: "Pending", submittedAt: daysAgo(0, 7) }),
  regJalurB({ ticketId: "AKT-2026-000105", tipeOrg: "Ranting", namaOrg: "Ranting NU Condongcatur",  pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Nurul Hasanah", jabatan: "Sekretaris", nik: "3404050505920005", hp: "+6281234567005", email: "nurul@ranting-condongcatur.id", status: "Approved", submittedAt: daysAgo(6), reviewedAt: daysAgo(5), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" }),
  regJalurB({ ticketId: "AKT-2026-000130", tipeOrg: "Ranting", namaOrg: "Ranting NU Banyuanyar Tengah", pw: "PWNU Jawa Timur", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kraksaan", namaAdmin: "Muhammad Rafi", jabatan: "Sekretaris", nik: "3507000000001300", hp: "+6281234500130", email: "muhammad.rafi@example.com", status: "Pending", submittedAt: "2026-05-29T02:30:00.000Z",
    sumberSuratTugas: "MANUAL_UPLOAD", suratTugasFile: "surat-tugas-ranting-banyuanyar-tengah.pdf",
  }),

  // Jalur B — dari PCNU Jombang
  regJalurB({ ticketId: "AKT-2026-000132", tipeOrg: "MWC", namaOrg: "MWCNU Diwek", pw: "PWNU Jawa Timur", sourcePcId: "pc-jbg", sourcePcName: "PCNU Kabupaten Jombang", namaAdmin: "Iwan Setiawan", jabatan: "Operator", nik: "3517181818860018", hp: "+6281234567018", email: "iwan@mwc-diwek.id", status: "Approved", submittedAt: daysAgo(4), reviewedAt: daysAgo(3), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001",
    sumberSuratTugas: "DIGDAYA_PERSURATAN", suratTugasFile: undefined, dokumenSistem: mockSuratTugasDigdaya[7],
  }),
  regJalurB({ ticketId: "AKT-2026-000134", tipeOrg: "Ranting", namaOrg: "Ranting NU Cukir", pw: "PWNU Jawa Timur", sourcePcId: "pc-jbg", sourcePcName: "PCNU Kabupaten Jombang", namaAdmin: "Rina Marlina", jabatan: "Sekretaris", nik: "3517202020900017", hp: "+6281234567017", email: "rina@ranting-cukir.id", status: "Pending", submittedAt: daysAgo(3, 12) }),

  // PW Dashboard — PWNU DIY mendaftarkan PCNU Kota Yogyakarta
  {
    jalur: "B",
    sumberPengajuan: "PW_DASHBOARD",
    tingkatPendaftar: "PW",
    ticketId: "AKT-2026-000201",
    tipeOrg: "PC",
    namaOrg: "PCNU Kota Yogyakarta",
    pw: "PWNU DI Yogyakarta",
    sourcePwId: "pw-diy",
    sourcePwName: "PWNU DI Yogyakarta",
    namaAdmin: "Ahmad Fauzan",
    jabatan: "Sekretaris",
    nik: "3404000000002010",
    hp: "+6281234567201",
    email: "ahmad.fauzan@example.com",
    sumberSuratTugas: "DIGDAYA_PERSURATAN",
    suratTugasFile: undefined,
    dokumenSistem: mockSuratTugasDigdaya[10],
    status: "Pending",
    submittedAt: daysAgo(3, 10),
  } as Registration,
];

export const seedPeruriBatches: PeruriBatch[] = [
  {
    id: "BATCH-2026-001",
    date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
    generatedAt: daysAgo(3, 16),
    count: 7,
    countA: 4,
    countB: 3,
    status: "Downloaded",
    downloadedBy: "admin@digdaya.nu.id",
    ticketIds: [
      "AKT-2026-000101","AKT-2026-000102","AKT-2026-000108","AKT-2026-000112",
      "AKT-2026-000103","AKT-2026-000105","AKT-2026-000132",
    ],
  },
];

export const seedAudit: AuditEntry[] = [
  { id: "a1", timestamp: daysAgo(30, 9),  actor: "admin@digdaya.nu.id",    role: "Super Admin", action: "GENERATE_ACCESS_CODE", detail: "Generate 20 kode akses untuk seed onboarding PC." },
  { id: "a2", timestamp: daysAgo(12, 10), actor: "fauzi@pcnu-jogja.id",    role: "Publik",      action: "VERIFY_ACCESS_CODE",   detail: "Verifikasi kode DGD-7K2M-9XQA berhasil." },
  { id: "a3", timestamp: daysAgo(5, 11),  actor: "fauzi@pcnu-jogja.id",    role: "Publik",      action: "SUBMIT_PUBLIC_ACTIVATION", ticketId: "AKT-2026-000101", detail: "Submit aktivasi publik untuk PCNU Kota Yogyakarta." },
  { id: "a4", timestamp: daysAgo(4, 9),   actor: "reviewer@digdaya.nu.id", role: "Reviewer",    action: "APPROVE_REGISTRATION", ticketId: "AKT-2026-000101", detail: "Menyetujui pendaftaran AKT-2026-000101. PCNU Kota Yogyakarta menjadi Production." },
  { id: "a5", timestamp: daysAgo(3, 16),  actor: "system",                 role: "System",      action: "GENERATE_PERURI_BATCH", detail: "Batch BATCH-2026-001 dibuat (7 record)." },
  { id: "a6", timestamp: daysAgo(2, 11),  actor: "reviewer@digdaya.nu.id", role: "Reviewer",    action: "REJECT_REGISTRATION",   ticketId: "AKT-2026-000123", detail: "Menolak pendaftaran. Scan surat tugas tidak terbaca." },
  { id: "a7", timestamp: daysAgo(1, 8),   actor: "pc@digdaya.nu.id",       role: "PC",          action: "SUBMIT_INTERNAL",       ticketId: "AKT-2026-000127", detail: "PCNU Sleman mendaftarkan LAZISNU PCNU Sleman (Dari Sistem)." },
];
