export type TipeOrg = "PC" | "MWC" | "Lembaga PC" | "Ranting";
export type Status = "Pending" | "Approved" | "Rejected";
export type Jalur = "A" | "B";
export type AccessCodeStatus = "Unused" | "Used" | "Expired" | "Disabled";

export interface MasterPC {
  id: string;
  nama: string;
  pw: string;
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
  pcId: string;
}

export interface AccessCode {
  code: string;
  pcId: string;
  pcName: string;
  pw: string;
  status: AccessCodeStatus;
  generatedAt: string;
  expiredAt: string;
  usedAt?: string;
  ticketId?: string;
}

export interface Registration {
  ticketId: string;
  jalur: Jalur;
  tipeOrg: TipeOrg;
  namaOrg: string;
  pw: string;
  accessCode?: string;        // Jalur A
  sourcePcId?: string;        // Jalur B
  sourcePcName?: string;      // Jalur B
  namaAdmin: string;
  jabatan: string;
  nik: string;
  hp: string;
  email: string;
  suratTugasFile?: string;
  status: Status;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectReason?: string;
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

// ====== Master Data ======
export const masterPC: MasterPC[] = [
  { id: "pc-jogja",   nama: "PCNU Kota Yogyakarta",    pw: "PWNU DI Yogyakarta", aktif: true  },
  { id: "pc-sleman",  nama: "PCNU Kabupaten Sleman",   pw: "PWNU DI Yogyakarta", aktif: true  },
  { id: "pc-bantul",  nama: "PCNU Bantul",             pw: "PWNU DI Yogyakarta", aktif: false },
  { id: "pc-kp",      nama: "PCNU Kulon Progo",        pw: "PWNU DI Yogyakarta", aktif: false },
  { id: "pc-gk",      nama: "PCNU Gunungkidul",        pw: "PWNU DI Yogyakarta", aktif: false },
  { id: "pc-solo",    nama: "PCNU Kota Surakarta",     pw: "PWNU Jawa Tengah",   aktif: true  },
  { id: "pc-klaten",  nama: "PCNU Kabupaten Klaten",   pw: "PWNU Jawa Tengah",   aktif: false },
  { id: "pc-mgl",     nama: "PCNU Kabupaten Magelang", pw: "PWNU Jawa Tengah",   aktif: false },
  { id: "pc-bms",     nama: "PCNU Kabupaten Banyumas", pw: "PWNU Jawa Tengah",   aktif: false },
  { id: "pc-jbg",     nama: "PCNU Kabupaten Jombang",  pw: "PWNU Jawa Timur",    aktif: true  },
];

export const masterMWC: MasterMWC[] = [
  { id: "mwc-depok",   nama: "MWCNU Depok",   pcId: "pc-sleman" },
  { id: "mwc-gamping", nama: "MWCNU Gamping", pcId: "pc-sleman" },
  { id: "mwc-mlati",   nama: "MWCNU Mlati",   pcId: "pc-sleman" },
  { id: "mwc-ngaglik", nama: "MWCNU Ngaglik", pcId: "pc-sleman" },
  { id: "mwc-godean",  nama: "MWCNU Godean",  pcId: "pc-sleman" },
];

export const masterLembaga: MasterLembaga[] = [
  { id: "lpc-maarif",  nama: "LP Ma'arif PCNU Sleman", pcId: "pc-sleman" },
  { id: "lpc-lazis",   nama: "LAZISNU PCNU Sleman",    pcId: "pc-sleman" },
  { id: "lpc-rmi",     nama: "RMINU PCNU Sleman",      pcId: "pc-sleman" },
  { id: "lpc-ldnu",    nama: "LDNU PCNU Sleman",       pcId: "pc-sleman" },
];

// Demo PC user maps to pc-sleman (sudah aktif)
export const demoPcUserPcId = "pc-sleman";

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

// ====== Access Codes ======
function gen(s: string) { return s; }
export const seedAccessCodes: AccessCode[] = [
  { code: gen("DGD-7K2M-9XQA"), pcId: "pc-jogja",  pcName: "PCNU Kota Yogyakarta",    pw: "PWNU DI Yogyakarta", status: "Used",     generatedAt: daysAgo(20), expiredAt: daysFromNow(10), usedAt: daysAgo(5),  ticketId: "AKT-2026-000101" },
  { code: gen("DGD-PL3X-22BV"), pcId: "pc-sleman", pcName: "PCNU Kabupaten Sleman",   pw: "PWNU DI Yogyakarta", status: "Used",     generatedAt: daysAgo(25), expiredAt: daysFromNow(5),  usedAt: daysAgo(12), ticketId: "AKT-2026-000102" },
  { code: gen("DGD-9HM2-AB7K"), pcId: "pc-solo",   pcName: "PCNU Kota Surakarta",     pw: "PWNU Jawa Tengah",   status: "Used",     generatedAt: daysAgo(18), expiredAt: daysFromNow(12), usedAt: daysAgo(3),  ticketId: "AKT-2026-000108" },
  { code: gen("DGD-X4Q1-77ZD"), pcId: "pc-jbg",    pcName: "PCNU Kabupaten Jombang",  pw: "PWNU Jawa Timur",    status: "Used",     generatedAt: daysAgo(15), expiredAt: daysFromNow(15), usedAt: daysAgo(6),  ticketId: "AKT-2026-000112" },
  { code: gen("DGD-MN8P-3KLR"), pcId: "pc-bantul", pcName: "PCNU Bantul",             pw: "PWNU DI Yogyakarta", status: "Unused",   generatedAt: daysAgo(5),  expiredAt: daysFromNow(25) },
  { code: gen("DGD-2C7J-BVQK"), pcId: "pc-kp",     pcName: "PCNU Kulon Progo",        pw: "PWNU DI Yogyakarta", status: "Unused",   generatedAt: daysAgo(5),  expiredAt: daysFromNow(25) },
  { code: gen("DGD-T5Z9-MWPE"), pcId: "pc-gk",     pcName: "PCNU Gunungkidul",        pw: "PWNU DI Yogyakarta", status: "Unused",   generatedAt: daysAgo(7),  expiredAt: daysFromNow(23) },
  { code: gen("DGD-AB12-CDEF"), pcId: "pc-klaten", pcName: "PCNU Kabupaten Klaten",   pw: "PWNU Jawa Tengah",   status: "Unused",   generatedAt: daysAgo(3),  expiredAt: daysFromNow(27) },
  { code: gen("DGD-GH34-JKLM"), pcId: "pc-mgl",    pcName: "PCNU Kabupaten Magelang", pw: "PWNU Jawa Tengah",   status: "Unused",   generatedAt: daysAgo(3),  expiredAt: daysFromNow(27) },
  { code: gen("DGD-NP56-QRST"), pcId: "pc-bms",    pcName: "PCNU Kabupaten Banyumas", pw: "PWNU Jawa Tengah",   status: "Unused",   generatedAt: daysAgo(2),  expiredAt: daysFromNow(28) },
  { code: gen("DGD-OLD1-EXPR"), pcId: "pc-bantul", pcName: "PCNU Bantul",             pw: "PWNU DI Yogyakarta", status: "Expired",  generatedAt: daysAgo(60), expiredAt: daysAgo(30) },
  { code: gen("DGD-OLD2-EXPR"), pcId: "pc-kp",     pcName: "PCNU Kulon Progo",        pw: "PWNU DI Yogyakarta", status: "Expired",  generatedAt: daysAgo(65), expiredAt: daysAgo(35) },
  { code: gen("DGD-DIS1-ABCD"), pcId: "pc-gk",     pcName: "PCNU Gunungkidul",        pw: "PWNU DI Yogyakarta", status: "Disabled", generatedAt: daysAgo(10), expiredAt: daysFromNow(20) },
  { code: gen("DGD-DIS2-EFGH"), pcId: "pc-mgl",    pcName: "PCNU Kabupaten Magelang", pw: "PWNU Jawa Tengah",   status: "Disabled", generatedAt: daysAgo(12), expiredAt: daysFromNow(18) },
  { code: gen("DGD-W7K3-XL2N"), pcId: "pc-klaten", pcName: "PCNU Kabupaten Klaten",   pw: "PWNU Jawa Tengah",   status: "Unused",   generatedAt: daysAgo(1),  expiredAt: daysFromNow(29) },
  { code: gen("DGD-V4M8-YT5R"), pcId: "pc-bms",    pcName: "PCNU Kabupaten Banyumas", pw: "PWNU Jawa Tengah",   status: "Unused",   generatedAt: daysAgo(1),  expiredAt: daysFromNow(29) },
  { code: gen("DGD-J2H6-WD9Q"), pcId: "pc-gk",     pcName: "PCNU Gunungkidul",        pw: "PWNU DI Yogyakarta", status: "Unused",   generatedAt: daysAgo(0),  expiredAt: daysFromNow(30) },
  { code: gen("DGD-K1L4-SR3M"), pcId: "pc-mgl",    pcName: "PCNU Kabupaten Magelang", pw: "PWNU Jawa Tengah",   status: "Unused",   generatedAt: daysAgo(0),  expiredAt: daysFromNow(30) },
  { code: gen("DGD-A8B5-CTRL"), pcId: "pc-kp",     pcName: "PCNU Kulon Progo",        pw: "PWNU DI Yogyakarta", status: "Unused",   generatedAt: daysAgo(0),  expiredAt: daysFromNow(30) },
  { code: gen("DGD-Z3Y7-XWVU"), pcId: "pc-bantul", pcName: "PCNU Bantul",             pw: "PWNU DI Yogyakarta", status: "Unused",   generatedAt: daysAgo(0),  expiredAt: daysFromNow(30) },
];

// ====== Registrations ======
// Jalur A = PC bootstrap, Jalur B = PC mendaftarkan organisasi bawahan
export const seedRegistrations: Registration[] = [
  // Jalur A — PC
  { ticketId: "AKT-2026-000101", jalur: "A", tipeOrg: "PC", namaOrg: "PCNU Kota Yogyakarta",   pw: "PWNU DI Yogyakarta", accessCode: "DGD-7K2M-9XQA", namaAdmin: "Ahmad Fauzi",       jabatan: "Sekretaris", nik: "3471010101900001", hp: "+6281234567001", email: "fauzi@pcnu-jogja.id",     status: "Approved", submittedAt: daysAgo(5), reviewedAt: daysAgo(4), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" },
  { ticketId: "AKT-2026-000102", jalur: "A", tipeOrg: "PC", namaOrg: "PCNU Kabupaten Sleman",  pw: "PWNU DI Yogyakarta", accessCode: "DGD-PL3X-22BV", namaAdmin: "Muhammad Hidayat",  jabatan: "Ketua",      nik: "3404020202800002", hp: "+6281234567002", email: "hidayat@pcnu-sleman.id",  status: "Approved", submittedAt: daysAgo(12), reviewedAt: daysAgo(11), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" },
  { ticketId: "AKT-2026-000108", jalur: "A", tipeOrg: "PC", namaOrg: "PCNU Kota Surakarta",    pw: "PWNU Jawa Tengah",   accessCode: "DGD-9HM2-AB7K", namaAdmin: "Hadi Pranoto",      jabatan: "Ketua",      nik: "3374080808820008", hp: "+6281234567008", email: "hadi@pcnu-solo.id",       status: "Approved", submittedAt: daysAgo(3), reviewedAt: daysAgo(2), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" },
  { ticketId: "AKT-2026-000112", jalur: "A", tipeOrg: "PC", namaOrg: "PCNU Kabupaten Jombang", pw: "PWNU Jawa Timur",    accessCode: "DGD-X4Q1-77ZD", namaAdmin: "Khairul Anwar",     jabatan: "Ketua",      nik: "3578121212840012", hp: "+6281234567012", email: "khairul@pcnu-jombang.id", status: "Approved", submittedAt: daysAgo(6), reviewedAt: daysAgo(5), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" },
  // Jalur A — Pending PC bootstrap
  { ticketId: "AKT-2026-000121", jalur: "A", tipeOrg: "PC", namaOrg: "PCNU Kabupaten Klaten",  pw: "PWNU Jawa Tengah",   accessCode: "DGD-W7K3-XL2N", namaAdmin: "Imam Subekti",      jabatan: "Sekretaris", nik: "3374090909860009", hp: "+6281234567009", email: "imam@pcnu-klaten.id",     status: "Pending", submittedAt: daysAgo(0, 8) },
  { ticketId: "AKT-2026-000122", jalur: "A", tipeOrg: "PC", namaOrg: "PCNU Kabupaten Banyumas",pw: "PWNU Jawa Tengah",   accessCode: "DGD-V4M8-YT5R", namaAdmin: "Salman Alfarisi",   jabatan: "Ketua",      nik: "3302222222880011", hp: "+6281234567011", email: "salman@pcnu-bms.id",      status: "Pending", submittedAt: daysAgo(2, 10) },
  { ticketId: "AKT-2026-000123", jalur: "A", tipeOrg: "PC", namaOrg: "PCNU Gunungkidul",       pw: "PWNU DI Yogyakarta", accessCode: "DGD-J2H6-WD9Q", namaAdmin: "Yusuf Mansur",      jabatan: "Sekretaris", nik: "3403030303850016", hp: "+6281234567016", email: "yusuf@pcnu-gk.id",        status: "Rejected", submittedAt: daysAgo(4), reviewedAt: daysAgo(3), reviewedBy: "reviewer@digdaya.nu.id", rejectReason: "Scan surat tugas tidak terbaca. Mohon upload ulang dengan kualitas lebih jelas." },

  // Jalur B — MWC didaftarkan PCNU Sleman
  { ticketId: "AKT-2026-000103", jalur: "B", tipeOrg: "MWC", namaOrg: "MWCNU Depok",     pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Siti Aminah",  jabatan: "Bendahara", nik: "3404030303850003", hp: "+6281234567003", email: "aminah@mwc-depok.id",   status: "Approved", submittedAt: daysAgo(5), reviewedAt: daysAgo(4), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" },
  { ticketId: "AKT-2026-000104", jalur: "B", tipeOrg: "MWC", namaOrg: "MWCNU Gamping",   pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Rahmat Hakim", jabatan: "Operator",  nik: "3404040404880004", hp: "+6281234567004", email: "rahmat@mwc-gamping.id", status: "Pending",  submittedAt: daysAgo(4) },
  { ticketId: "AKT-2026-000124", jalur: "B", tipeOrg: "MWC", namaOrg: "MWCNU Mlati",     pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Hasan Basri",  jabatan: "Ketua",     nik: "3404202020830020", hp: "+6281234567020", email: "hasan@mwc-mlati.id",    status: "Pending",  submittedAt: daysAgo(1, 13) },
  { ticketId: "AKT-2026-000125", jalur: "B", tipeOrg: "MWC", namaOrg: "MWCNU Ngaglik",   pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Faisal Akbar", jabatan: "Sekretaris",nik: "3404252525910025", hp: "+6281234567025", email: "faisal@mwc-ngaglik.id", status: "Pending",  submittedAt: daysAgo(4, 15) },
  { ticketId: "AKT-2026-000126", jalur: "B", tipeOrg: "MWC", namaOrg: "MWCNU Godean",    pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Bagus Nugroho",jabatan: "Operator",  nik: "3404262626900026", hp: "+6281234567026", email: "bagus@mwc-godean.id",   status: "Rejected", submittedAt: daysAgo(3), reviewedAt: daysAgo(2), reviewedBy: "reviewer@digdaya.nu.id", rejectReason: "Format NIK tidak sesuai. Mohon periksa kembali." },

  // Jalur B — Lembaga PC
  { ticketId: "AKT-2026-000107", jalur: "B", tipeOrg: "Lembaga PC", namaOrg: "LP Ma'arif PCNU Sleman", pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Zainal Abidin", jabatan: "Sekretaris", nik: "3404070707890007", hp: "+6281234567007", email: "zainal@lpmaarif-sleman.id", status: "Approved", submittedAt: daysAgo(6), reviewedAt: daysAgo(5), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" },
  { ticketId: "AKT-2026-000127", jalur: "B", tipeOrg: "Lembaga PC", namaOrg: "LAZISNU PCNU Sleman",    pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Halimah Yusuf", jabatan: "Bendahara",  nik: "3404272727870027", hp: "+6281234567027", email: "halimah@lazis-sleman.id",    status: "Pending",  submittedAt: daysAgo(1) },
  { ticketId: "AKT-2026-000128", jalur: "B", tipeOrg: "Lembaga PC", namaOrg: "RMINU PCNU Sleman",      pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Anisa Putri",   jabatan: "Sekretaris", nik: "3404282828920028", hp: "+6281234567028", email: "anisa@rmi-sleman.id",        status: "Pending",  submittedAt: daysAgo(0, 7) },
  { ticketId: "AKT-2026-000129", jalur: "B", tipeOrg: "Lembaga PC", namaOrg: "LDNU PCNU Sleman",       pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Imron Rosyadi", jabatan: "Ketua",      nik: "3404292929840029", hp: "+6281234567029", email: "imron@ldnu-sleman.id",       status: "Approved", submittedAt: daysAgo(8), reviewedAt: daysAgo(7), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" },

  // Jalur B — Ranting manual
  { ticketId: "AKT-2026-000105", jalur: "B", tipeOrg: "Ranting", namaOrg: "Ranting NU Condongcatur",  pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Nurul Hasanah", jabatan: "Sekretaris", nik: "3404050505920005", hp: "+6281234567005", email: "nurul@ranting-condongcatur.id", status: "Approved", submittedAt: daysAgo(6), reviewedAt: daysAgo(5), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" },
  { ticketId: "AKT-2026-000106", jalur: "B", tipeOrg: "Ranting", namaOrg: "Ranting NU Maguwoharjo",   pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Budi Santoso",  jabatan: "Ketua",      nik: "3404060606870006", hp: "+6281234567006", email: "budi@ranting-maguwo.id",       status: "Rejected", submittedAt: daysAgo(3), reviewedAt: daysAgo(2), reviewedBy: "reviewer@digdaya.nu.id", rejectReason: "NIK tidak sesuai dokumen SK. Mohon perbaiki." },
  { ticketId: "AKT-2026-000130", jalur: "B", tipeOrg: "Ranting", namaOrg: "Ranting NU Ambarketawang", pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Dewi Lestari",  jabatan: "Sekretaris", nik: "3404303030930030", hp: "+6281234567030", email: "dewi@ranting-ambar.id",        status: "Pending",  submittedAt: daysAgo(2, 11) },
  { ticketId: "AKT-2026-000131", jalur: "B", tipeOrg: "Ranting", namaOrg: "Ranting NU Sariharjo",     pw: "PWNU DI Yogyakarta", sourcePcId: "pc-sleman", sourcePcName: "PCNU Kabupaten Sleman", namaAdmin: "Asep Suryadi",  jabatan: "Operator",   nik: "3404313131890031", hp: "+6281234567031", email: "asep@ranting-sari.id",         status: "Pending",  submittedAt: daysAgo(5, 9) },

  // Jalur B — dari PC lain (PCNU Jombang)
  { ticketId: "AKT-2026-000132", jalur: "B", tipeOrg: "MWC",     namaOrg: "MWCNU Diwek",      pw: "PWNU Jawa Timur",  sourcePcId: "pc-jbg",  sourcePcName: "PCNU Kabupaten Jombang", namaAdmin: "Iwan Setiawan", jabatan: "Operator",   nik: "3517181818860018", hp: "+6281234567018", email: "iwan@mwc-diwek.id",     status: "Approved", submittedAt: daysAgo(4), reviewedAt: daysAgo(3), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" },
  { ticketId: "AKT-2026-000133", jalur: "B", tipeOrg: "MWC",     namaOrg: "MWCNU Tembelang",  pw: "PWNU Jawa Timur",  sourcePcId: "pc-jbg",  sourcePcName: "PCNU Kabupaten Jombang", namaAdmin: "Fatimah Zahra", jabatan: "Bendahara",  nik: "3517191919910010", hp: "+6281234567019", email: "fatimah@mwc-tembelang.id", status: "Pending",   submittedAt: daysAgo(5, 10) },
  { ticketId: "AKT-2026-000134", jalur: "B", tipeOrg: "Ranting", namaOrg: "Ranting NU Cukir", pw: "PWNU Jawa Timur",  sourcePcId: "pc-jbg",  sourcePcName: "PCNU Kabupaten Jombang", namaAdmin: "Rina Marlina",  jabatan: "Sekretaris", nik: "3517202020900017", hp: "+6281234567017", email: "rina@ranting-cukir.id",  status: "Pending",   submittedAt: daysAgo(3, 12) },

  // Jalur B — dari PCNU Kota Surakarta
  { ticketId: "AKT-2026-000135", jalur: "B", tipeOrg: "Lembaga PC", namaOrg: "LP Ma'arif PCNU Surakarta", pw: "PWNU Jawa Tengah", sourcePcId: "pc-solo", sourcePcName: "PCNU Kota Surakarta", namaAdmin: "Joko Susilo", jabatan: "Sekretaris", nik: "3372353535870035", hp: "+6281234567035", email: "joko@lpm-solo.id", status: "Pending", submittedAt: daysAgo(1, 14) },
  { ticketId: "AKT-2026-000136", jalur: "B", tipeOrg: "MWC",        namaOrg: "MWCNU Laweyan",             pw: "PWNU Jawa Tengah", sourcePcId: "pc-solo", sourcePcName: "PCNU Kota Surakarta", namaAdmin: "Wahyu Kurnia", jabatan: "Operator", nik: "3372363636890036", hp: "+6281234567036", email: "wahyu@mwc-laweyan.id", status: "Approved", submittedAt: daysAgo(7), reviewedAt: daysAgo(6), reviewedBy: "reviewer@digdaya.nu.id", peruriBatchId: "BATCH-2026-001" },

  // Jalur A — yang sudah lewat SLA
  { ticketId: "AKT-2026-000137", jalur: "A", tipeOrg: "PC", namaOrg: "PCNU Kabupaten Magelang", pw: "PWNU Jawa Tengah", accessCode: "DGD-K1L4-SR3M", namaAdmin: "Sutrisno Hadi", jabatan: "Ketua", nik: "3308373737880037", hp: "+6281234567037", email: "sutrisno@pcnu-mgl.id", status: "Pending", submittedAt: daysAgo(5, 9) },
];

export const seedPeruriBatches: PeruriBatch[] = [
  {
    id: "BATCH-2026-001",
    date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
    generatedAt: daysAgo(3, 16),
    count: 9,
    countA: 4,
    countB: 5,
    status: "Downloaded",
    downloadedBy: "admin@digdaya.nu.id",
    ticketIds: [
      "AKT-2026-000101","AKT-2026-000102","AKT-2026-000108","AKT-2026-000112",
      "AKT-2026-000103","AKT-2026-000107","AKT-2026-000105","AKT-2026-000129","AKT-2026-000132","AKT-2026-000136",
    ],
  },
];

export const seedAudit: AuditEntry[] = [
  { id: "a1", timestamp: daysAgo(30, 9),  actor: "admin@digdaya.nu.id",    role: "Super Admin", action: "GENERATE_ACCESS_CODE", detail: "Generate 20 kode akses untuk seed onboarding PC." },
  { id: "a2", timestamp: daysAgo(12, 10), actor: "fauzi@pcnu-jogja.id",    role: "Publik",      action: "VERIFY_ACCESS_CODE",   detail: "Verifikasi kode DGD-7K2M-9XQA berhasil." },
  { id: "a3", timestamp: daysAgo(5, 11),  actor: "fauzi@pcnu-jogja.id",    role: "Publik",      action: "SUBMIT_JALUR_A",       ticketId: "AKT-2026-000101", detail: "Submit pendaftaran Jalur A PCNU Kota Yogyakarta." },
  { id: "a4", timestamp: daysAgo(4, 9),   actor: "reviewer@digdaya.nu.id", role: "Reviewer",    action: "APPROVE_REGISTRATION", ticketId: "AKT-2026-000101", detail: "Menyetujui pendaftaran AKT-2026-000101." },
  { id: "a5", timestamp: daysAgo(4, 9),   actor: "system",                 role: "System",      action: "AUTO_PROVISION_ACCOUNT", ticketId: "AKT-2026-000101", detail: "Akun administrator dibuat dengan status menunggu aktivasi." },
  { id: "a6", timestamp: daysAgo(3, 16),  actor: "system",                 role: "System",      action: "GENERATE_PERURI_BATCH", detail: "Batch BATCH-2026-001 dibuat (10 record)." },
  { id: "a7", timestamp: daysAgo(2, 10),  actor: "admin@digdaya.nu.id",    role: "Super Admin", action: "DOWNLOAD_PERURI_BATCH", detail: "Mengunduh BATCH-2026-001." },
  { id: "a8", timestamp: daysAgo(2, 11),  actor: "reviewer@digdaya.nu.id", role: "Reviewer",    action: "REJECT_REGISTRATION",  ticketId: "AKT-2026-000106", detail: "Menolak pendaftaran. NIK tidak sesuai dokumen SK." },
  { id: "a9", timestamp: daysAgo(1, 8),   actor: "pc@digdaya.nu.id",       role: "PC",          action: "SUBMIT_JALUR_B",       ticketId: "AKT-2026-000127", detail: "PCNU Sleman mendaftarkan LAZISNU PCNU Sleman." },
  { id: "a10", timestamp: daysAgo(0, 9),  actor: "admin@digdaya.nu.id",    role: "Super Admin", action: "DISABLE_ACCESS_CODE",  detail: "Menonaktifkan kode DGD-DIS1-ABCD." },
];
