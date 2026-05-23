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

export interface AccessCode {
  code: string;
  tingkat: Tingkat;
  /** PC id when tingkat = PC, PW id when tingkat = PW */
  orgId: string;
  orgName: string;
  /** wilayah / PW name for display */
  pw: string;
  status: AccessCodeStatus;
  generatedAt: string;
  expiredAt: string;
  usedAt?: string;
  ticketId?: string;
  // legacy alias for older code that still uses .pcId / .pcName
  pcId?: string;
  pcName?: string;
}

export interface DokumenSistem {
  documentId: string;
  nomorSurat: string;
  namaDokumen: string;
  tanggalSurat: string; // ISO date
  penandatangan: string;
  status: string; // e.g. "Tertandatangani"
}

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

  // Jalur B / Internal source
  sourcePcId?: string;
  sourcePcName?: string;
  sourcePwId?: string;
  sourcePwName?: string;

  // Administrator
  namaAdmin: string;
  jabatan: string;
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
];

export const masterPC: MasterPC[] = [
  { id: "pc-jogja",   nama: "PCNU Kota Yogyakarta",    pw: "PWNU DI Yogyakarta", pwId: "pw-jogja",  statusOrg: "Production",       aktif: true  },
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
  { code: "DGD-MN8P-3KLR", tingkat: "PC", ...pcMeta("pc-bantul"), status: "Unused",   generatedAt: daysAgo(5),  expiredAt: daysFromNow(25) },
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
  regJalurA({ ticketId: "AKT-2026-000122", namaOrg: "PCNU Kabupaten Banyumas",pw: "PWNU Jawa Tengah",   accessCode: "DGD-NP56-QRST", namaAdmin: "Salman Alfarisi",   jabatan: "Ketua",      nik: "3302222222880011", hp: "+6281234567011", email: "salman@pcnu-bms.id",      status: "Pending", submittedAt: daysAgo(2, 10) }),
  regJalurA({ ticketId: "AKT-2026-000123", namaOrg: "PCNU Gunungkidul",       pw: "PWNU DI Yogyakarta", accessCode: "DGD-T5Z9-MWPE", namaAdmin: "Yusuf Mansur",      jabatan: "Sekretaris", nik: "3403030303850016", hp: "+6281234567016", email: "yusuf@pcnu-gk.id",        status: "Rejected", submittedAt: daysAgo(4), reviewedAt: daysAgo(3), reviewedBy: "reviewer@digdaya.nu.id", rejectReason: "Scan surat tugas tidak terbaca. Mohon upload ulang dengan kualitas lebih jelas." }),

  // Jalur B — PCNU Sleman mendaftarkan MWC, Lembaga, Ranting (campuran sumber surat tugas)
  regJalurB({ ticketId: "AKT-2026-000103", tipeOrg: "MWC", namaOrg: "MWCNU Depok", pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Siti Aminah",  jabatan: "Bendahara", nik: "3404030303850003", hp: "+6281234567003", email: "aminah@mwc-depok.id",   status: "Approved", submittedAt: daysAgo(5), reviewedAt: daysAgo(4), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" }),
  regJalurB({ ticketId: "AKT-2026-000124", tipeOrg: "MWC", namaOrg: "MWCNU Mlati",     pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Hasan Basri",  jabatan: "Ketua",     nik: "3404202020830020", hp: "+6281234567020", email: "hasan@mwc-mlati.id", status: "Pending", submittedAt: daysAgo(1, 13),
    sumberSuratTugas: "DIGDAYA_PERSURATAN", suratTugasFile: undefined,
    dokumenSistem: mockSuratTugasDigdaya[0],
  }),
  regJalurB({ ticketId: "AKT-2026-000125", tipeOrg: "MWC", namaOrg: "MWCNU Ngaglik",   pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Faisal Akbar", jabatan: "Sekretaris",nik: "3404252525910025", hp: "+6281234567025", email: "faisal@mwc-ngaglik.id", status: "Pending", submittedAt: daysAgo(4, 15),
    sumberSuratTugas: "DIGDAYA_PERSURATAN", suratTugasFile: undefined,
    dokumenSistem: mockSuratTugasDigdaya[3],
  }),
  regJalurB({ ticketId: "AKT-2026-000127", tipeOrg: "Lembaga PC", namaOrg: "LAZISNU PCNU Sleman", pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Halimah Yusuf", jabatan: "Bendahara", nik: "3404272727870027", hp: "+6281234567027", email: "halimah@lazis-sleman.id", status: "Pending", submittedAt: daysAgo(1),
    sumberSuratTugas: "DIGDAYA_PERSURATAN", suratTugasFile: undefined,
    dokumenSistem: mockSuratTugasDigdaya[1],
  }),
  regJalurB({ ticketId: "AKT-2026-000128", tipeOrg: "Lembaga PC", namaOrg: "RMINU PCNU Sleman",   pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Anisa Putri",   jabatan: "Sekretaris", nik: "3404282828920028", hp: "+6281234567028", email: "anisa@rmi-sleman.id", status: "Pending", submittedAt: daysAgo(0, 7) }),
  regJalurB({ ticketId: "AKT-2026-000105", tipeOrg: "Ranting", namaOrg: "Ranting NU Condongcatur",  pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Nurul Hasanah", jabatan: "Sekretaris", nik: "3404050505920005", hp: "+6281234567005", email: "nurul@ranting-condongcatur.id", status: "Approved", submittedAt: daysAgo(6), reviewedAt: daysAgo(5), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" }),
  regJalurB({ ticketId: "AKT-2026-000130", tipeOrg: "Ranting", namaOrg: "Ranting NU Ambarketawang", pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Dewi Lestari",  jabatan: "Sekretaris", nik: "3404303030930030", hp: "+6281234567030", email: "dewi@ranting-ambar.id", status: "Pending", submittedAt: daysAgo(2, 11),
    sumberSuratTugas: "DIGDAYA_PERSURATAN", suratTugasFile: undefined,
    dokumenSistem: mockSuratTugasDigdaya[2],
  }),

  // Jalur B — dari PCNU Jombang
  regJalurB({ ticketId: "AKT-2026-000132", tipeOrg: "MWC", namaOrg: "MWCNU Diwek", pw: "PWNU Jawa Timur", sourcePcId: "pc-jbg", sourcePcName: "PCNU Kabupaten Jombang", namaAdmin: "Iwan Setiawan", jabatan: "Operator", nik: "3517181818860018", hp: "+6281234567018", email: "iwan@mwc-diwek.id", status: "Approved", submittedAt: daysAgo(4), reviewedAt: daysAgo(3), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001",
    sumberSuratTugas: "DIGDAYA_PERSURATAN", suratTugasFile: undefined, dokumenSistem: mockSuratTugasDigdaya[7],
  }),
  regJalurB({ ticketId: "AKT-2026-000134", tipeOrg: "Ranting", namaOrg: "Ranting NU Cukir", pw: "PWNU Jawa Timur", sourcePcId: "pc-jbg", sourcePcName: "PCNU Kabupaten Jombang", namaAdmin: "Rina Marlina", jabatan: "Sekretaris", nik: "3517202020900017", hp: "+6281234567017", email: "rina@ranting-cukir.id", status: "Pending", submittedAt: daysAgo(3, 12) }),
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
