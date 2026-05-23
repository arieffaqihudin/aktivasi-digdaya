export type Tingkat = "PC" | "MWC" | "Ranting" | "Lembaga PC";
export type Status = "Pending" | "Approved" | "Rejected";

export interface MasterKepengurusan {
  id: string;
  nama: string;
  tingkat: Tingkat;
  pw: string;
  pcInduk?: string;
  mwcInduk?: string;
  statusData: "Aktif" | "Perlu Verifikasi";
}

export interface Registration {
  ticketId: string;
  namaKepengurusan: string;
  tingkat: Tingkat;
  pw: string;
  namaAdmin: string;
  jabatan: string;
  nik: string;
  hp: string;
  email: string;
  skFile?: string;
  suratTugasFile?: string;
  status: Status;
  submittedAt: string; // ISO
  reviewedAt?: string;
  reviewedBy?: string;
  rejectReason?: string;
  includedInPeruriBatch?: boolean;
  peruriBatchId?: string;
}

export interface PeruriBatch {
  id: string;
  date: string; // YYYY-MM-DD
  generatedAt: string;
  count: number;
  status: "Ready" | "Downloaded";
  downloadedBy?: string;
  ticketIds: string[];
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action:
    | "SUBMIT_REGISTRATION"
    | "APPROVE_REGISTRATION"
    | "REJECT_REGISTRATION"
    | "GENERATE_PERURI_BATCH"
    | "DOWNLOAD_PERURI_BATCH"
    | "UPDATE_SLA_SETTING";
  ticketId?: string;
  detail: string;
}

export const masterKepengurusan: MasterKepengurusan[] = [
  { id: "m1", nama: "PCNU Kota Yogyakarta", tingkat: "PC", pw: "PWNU DI Yogyakarta", statusData: "Aktif" },
  { id: "m2", nama: "PCNU Kabupaten Sleman", tingkat: "PC", pw: "PWNU DI Yogyakarta", statusData: "Aktif" },
  { id: "m3", nama: "PCNU Kabupaten Bantul", tingkat: "PC", pw: "PWNU DI Yogyakarta", statusData: "Aktif" },
  { id: "m4", nama: "PCNU Kota Semarang", tingkat: "PC", pw: "PWNU Jawa Tengah", statusData: "Aktif" },
  { id: "m5", nama: "PCNU Kabupaten Jepara", tingkat: "PC", pw: "PWNU Jawa Tengah", statusData: "Aktif" },
  { id: "m6", nama: "PCNU Kota Surabaya", tingkat: "PC", pw: "PWNU Jawa Timur", statusData: "Aktif" },
  { id: "m7", nama: "PCNU Kabupaten Bandung", tingkat: "PC", pw: "PWNU Jawa Barat", statusData: "Aktif" },
  { id: "m8", nama: "MWCNU Depok", tingkat: "MWC", pw: "PWNU DI Yogyakarta", pcInduk: "PCNU Kabupaten Sleman", statusData: "Aktif" },
  { id: "m9", nama: "MWCNU Gamping", tingkat: "MWC", pw: "PWNU DI Yogyakarta", pcInduk: "PCNU Kabupaten Sleman", statusData: "Aktif" },
  { id: "m10", nama: "MWCNU Mlati", tingkat: "MWC", pw: "PWNU DI Yogyakarta", pcInduk: "PCNU Kabupaten Sleman", statusData: "Aktif" },
  { id: "m11", nama: "MWCNU Banguntapan", tingkat: "MWC", pw: "PWNU DI Yogyakarta", pcInduk: "PCNU Kabupaten Bantul", statusData: "Aktif" },
  { id: "m12", nama: "MWCNU Tembalang", tingkat: "MWC", pw: "PWNU Jawa Tengah", pcInduk: "PCNU Kota Semarang", statusData: "Aktif" },
  { id: "m13", nama: "MWCNU Tahunan", tingkat: "MWC", pw: "PWNU Jawa Tengah", pcInduk: "PCNU Kabupaten Jepara", statusData: "Perlu Verifikasi" },
  { id: "m14", nama: "MWCNU Rungkut", tingkat: "MWC", pw: "PWNU Jawa Timur", pcInduk: "PCNU Kota Surabaya", statusData: "Aktif" },
  { id: "m15", nama: "MWCNU Cileunyi", tingkat: "MWC", pw: "PWNU Jawa Barat", pcInduk: "PCNU Kabupaten Bandung", statusData: "Aktif" },
  { id: "m16", nama: "Ranting NU Condongcatur", tingkat: "Ranting", pw: "PWNU DI Yogyakarta", mwcInduk: "MWCNU Depok", statusData: "Aktif" },
  { id: "m17", nama: "Ranting NU Maguwoharjo", tingkat: "Ranting", pw: "PWNU DI Yogyakarta", mwcInduk: "MWCNU Depok", statusData: "Aktif" },
  { id: "m18", nama: "Ranting NU Ambarketawang", tingkat: "Ranting", pw: "PWNU DI Yogyakarta", mwcInduk: "MWCNU Gamping", statusData: "Aktif" },
  { id: "m19", nama: "Ranting NU Wonocolo", tingkat: "Ranting", pw: "PWNU Jawa Timur", mwcInduk: "MWCNU Rungkut", statusData: "Aktif" },
  { id: "m20", nama: "Ranting NU Sukamiskin", tingkat: "Ranting", pw: "PWNU Jawa Barat", mwcInduk: "MWCNU Cileunyi", statusData: "Aktif" },
  { id: "m21", nama: "Lembaga PC LP Ma'arif Sleman", tingkat: "Lembaga PC", pw: "PWNU DI Yogyakarta", pcInduk: "PCNU Kabupaten Sleman", statusData: "Aktif" },
  { id: "m22", nama: "Lembaga PC LBM Semarang", tingkat: "Lembaga PC", pw: "PWNU Jawa Tengah", pcInduk: "PCNU Kota Semarang", statusData: "Aktif" },
  { id: "m23", nama: "Lembaga PC LAZISNU Surabaya", tingkat: "Lembaga PC", pw: "PWNU Jawa Timur", pcInduk: "PCNU Kota Surabaya", statusData: "Aktif" },
];

const daysAgo = (n: number, hour = 9) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const seedRegistrations: Registration[] = [
  { ticketId: "AKT-2026-000101", namaKepengurusan: "PCNU Kota Yogyakarta", tingkat: "PC", pw: "PWNU DI Yogyakarta", namaAdmin: "Ahmad Fauzi", jabatan: "Sekretaris", nik: "3471010101900001", hp: "+6281234567001", email: "fauzi@pcnu-jogja.id", status: "Pending", submittedAt: daysAgo(0, 8) },
  { ticketId: "AKT-2026-000102", namaKepengurusan: "PCNU Kabupaten Sleman", tingkat: "PC", pw: "PWNU DI Yogyakarta", namaAdmin: "Muhammad Hidayat", jabatan: "Ketua", nik: "3404020202800002", hp: "+6281234567002", email: "hidayat@pcnu-sleman.id", status: "Pending", submittedAt: daysAgo(2) },
  { ticketId: "AKT-2026-000103", namaKepengurusan: "MWCNU Depok", tingkat: "MWC", pw: "PWNU DI Yogyakarta", namaAdmin: "Siti Aminah", jabatan: "Bendahara", nik: "3404030303850003", hp: "+6281234567003", email: "aminah@mwc-depok.id", status: "Approved", submittedAt: daysAgo(5), reviewedAt: daysAgo(4), reviewedBy: "Reviewer Digdaya", includedInPeruriBatch: true, peruriBatchId: "BATCH-2026-001" },
  { ticketId: "AKT-2026-000104", namaKepengurusan: "MWCNU Gamping", tingkat: "MWC", pw: "PWNU DI Yogyakarta", namaAdmin: "Rahmat Hakim", jabatan: "Operator", nik: "3404040404880004", hp: "+6281234567004", email: "rahmat@mwc-gamping.id", status: "Pending", submittedAt: daysAgo(4) },
  { ticketId: "AKT-2026-000105", namaKepengurusan: "Ranting NU Condongcatur", tingkat: "Ranting", pw: "PWNU DI Yogyakarta", namaAdmin: "Nurul Hasanah", jabatan: "Sekretaris", nik: "3404050505920005", hp: "+6281234567005", email: "nurul@ranting-condongcatur.id", status: "Approved", submittedAt: daysAgo(6), reviewedAt: daysAgo(5), reviewedBy: "Reviewer Digdaya", includedInPeruriBatch: true, peruriBatchId: "BATCH-2026-001" },
  { ticketId: "AKT-2026-000106", namaKepengurusan: "Ranting NU Maguwoharjo", tingkat: "Ranting", pw: "PWNU DI Yogyakarta", namaAdmin: "Budi Santoso", jabatan: "Ketua", nik: "3404060606870006", hp: "+6281234567006", email: "budi@ranting-maguwo.id", status: "Rejected", submittedAt: daysAgo(3), reviewedAt: daysAgo(2), reviewedBy: "Reviewer Digdaya", rejectReason: "NIK tidak sesuai dengan dokumen SK Penunjukan. Mohon perbaiki dan kirim ulang." },
  { ticketId: "AKT-2026-000107", namaKepengurusan: "Lembaga PC LP Ma'arif Sleman", tingkat: "Lembaga PC", pw: "PWNU DI Yogyakarta", namaAdmin: "Zainal Abidin", jabatan: "Sekretaris", nik: "3404070707890007", hp: "+6281234567007", email: "zainal@lpmaarif-sleman.id", status: "Pending", submittedAt: daysAgo(1) },
  { ticketId: "AKT-2026-000108", namaKepengurusan: "PCNU Kota Semarang", tingkat: "PC", pw: "PWNU Jawa Tengah", namaAdmin: "Hadi Pranoto", jabatan: "Ketua", nik: "3374080808820008", hp: "+6281234567008", email: "hadi@pcnu-semarang.id", status: "Pending", submittedAt: daysAgo(4, 14) },
  { ticketId: "AKT-2026-000109", namaKepengurusan: "MWCNU Tembalang", tingkat: "MWC", pw: "PWNU Jawa Tengah", namaAdmin: "Imam Subekti", jabatan: "Operator", nik: "3374090909860009", hp: "+6281234567009", email: "imam@mwc-tembalang.id", status: "Approved", submittedAt: daysAgo(7), reviewedAt: daysAgo(6), reviewedBy: "Reviewer Digdaya", includedInPeruriBatch: true, peruriBatchId: "BATCH-2026-001" },
  { ticketId: "AKT-2026-000110", namaKepengurusan: "MWCNU Tahunan", tingkat: "MWC", pw: "PWNU Jawa Tengah", namaAdmin: "Fatimah Zahra", jabatan: "Bendahara", nik: "3320101010910010", hp: "+6281234567010", email: "fatimah@mwc-tahunan.id", status: "Pending", submittedAt: daysAgo(5, 10) },
  { ticketId: "AKT-2026-000111", namaKepengurusan: "PCNU Kabupaten Jepara", tingkat: "PC", pw: "PWNU Jawa Tengah", namaAdmin: "Salman Alfarisi", jabatan: "Sekretaris", nik: "3320111111880011", hp: "+6281234567011", email: "salman@pcnu-jepara.id", status: "Approved", submittedAt: daysAgo(8), reviewedAt: daysAgo(7), reviewedBy: "Reviewer Digdaya", includedInPeruriBatch: true, peruriBatchId: "BATCH-2026-001" },
  { ticketId: "AKT-2026-000112", namaKepengurusan: "PCNU Kota Surabaya", tingkat: "PC", pw: "PWNU Jawa Timur", namaAdmin: "Khairul Anwar", jabatan: "Ketua", nik: "3578121212840012", hp: "+6281234567012", email: "khairul@pcnu-surabaya.id", status: "Pending", submittedAt: daysAgo(0, 11) },
  { ticketId: "AKT-2026-000113", namaKepengurusan: "MWCNU Rungkut", tingkat: "MWC", pw: "PWNU Jawa Timur", namaAdmin: "Dewi Lestari", jabatan: "Sekretaris", nik: "3578131313930013", hp: "+6281234567013", email: "dewi@mwc-rungkut.id", status: "Rejected", submittedAt: daysAgo(6), reviewedAt: daysAgo(5), reviewedBy: "Reviewer Digdaya", rejectReason: "Dokumen Surat Tugas tidak terbaca. Mohon upload ulang dengan kualitas yang lebih jelas." },
  { ticketId: "AKT-2026-000114", namaKepengurusan: "Ranting NU Wonocolo", tingkat: "Ranting", pw: "PWNU Jawa Timur", namaAdmin: "Asep Suryadi", jabatan: "Operator", nik: "3578141414890014", hp: "+6281234567014", email: "asep@ranting-wonocolo.id", status: "Pending", submittedAt: daysAgo(2, 15) },
  { ticketId: "AKT-2026-000115", namaKepengurusan: "Lembaga PC LAZISNU Surabaya", tingkat: "Lembaga PC", pw: "PWNU Jawa Timur", namaAdmin: "Halimah Yusuf", jabatan: "Bendahara", nik: "3578151515870015", hp: "+6281234567015", email: "halimah@lazisnu-sby.id", status: "Approved", submittedAt: daysAgo(5), reviewedAt: daysAgo(4), reviewedBy: "Reviewer Digdaya", includedInPeruriBatch: true, peruriBatchId: "BATCH-2026-001" },
  { ticketId: "AKT-2026-000116", namaKepengurusan: "PCNU Kabupaten Bandung", tingkat: "PC", pw: "PWNU Jawa Barat", namaAdmin: "Yusuf Mansur", jabatan: "Ketua", nik: "3204161616850016", hp: "+6281234567016", email: "yusuf@pcnu-bandung.id", status: "Pending", submittedAt: daysAgo(1, 9) },
  { ticketId: "AKT-2026-000117", namaKepengurusan: "MWCNU Cileunyi", tingkat: "MWC", pw: "PWNU Jawa Barat", namaAdmin: "Rina Marlina", jabatan: "Sekretaris", nik: "3204171717900017", hp: "+6281234567017", email: "rina@mwc-cileunyi.id", status: "Pending", submittedAt: daysAgo(3, 12) },
  { ticketId: "AKT-2026-000118", namaKepengurusan: "Ranting NU Sukamiskin", tingkat: "Ranting", pw: "PWNU Jawa Barat", namaAdmin: "Iwan Setiawan", jabatan: "Operator", nik: "3204181818860018", hp: "+6281234567018", email: "iwan@ranting-sukamiskin.id", status: "Approved", submittedAt: daysAgo(4), reviewedAt: daysAgo(3), reviewedBy: "Reviewer Digdaya", includedInPeruriBatch: true, peruriBatchId: "BATCH-2026-001" },
  { ticketId: "AKT-2026-000119", namaKepengurusan: "Lembaga PC LBM Semarang", tingkat: "Lembaga PC", pw: "PWNU Jawa Tengah", namaAdmin: "Anisa Putri", jabatan: "Sekretaris", nik: "3374191919920019", hp: "+6281234567019", email: "anisa@lbm-semarang.id", status: "Pending", submittedAt: daysAgo(0, 7) },
  { ticketId: "AKT-2026-000120", namaKepengurusan: "MWCNU Banguntapan", tingkat: "MWC", pw: "PWNU DI Yogyakarta", namaAdmin: "Hasan Basri", jabatan: "Ketua", nik: "3404202020830020", hp: "+6281234567020", email: "hasan@mwc-banguntapan.id", status: "Pending", submittedAt: daysAgo(4, 13) },
];

export const seedPeruriBatches: PeruriBatch[] = [
  {
    id: "BATCH-2026-001",
    date: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
    generatedAt: daysAgo(3, 16),
    count: 6,
    status: "Downloaded",
    downloadedBy: "admin@digdaya.nu.id",
    ticketIds: ["AKT-2026-000103", "AKT-2026-000105", "AKT-2026-000109", "AKT-2026-000111", "AKT-2026-000115", "AKT-2026-000118"],
  },
];

export const seedAudit: AuditEntry[] = [
  { id: "a1", timestamp: daysAgo(3, 16), actor: "system", role: "System", action: "GENERATE_PERURI_BATCH", detail: "Batch BATCH-2026-001 (6 record) berhasil dibuat." },
  { id: "a2", timestamp: daysAgo(2, 10), actor: "admin@digdaya.nu.id", role: "Super Admin", action: "DOWNLOAD_PERURI_BATCH", detail: "Mengunduh BATCH-2026-001." },
  { id: "a3", timestamp: daysAgo(4, 9), actor: "reviewer@digdaya.nu.id", role: "Reviewer", action: "APPROVE_REGISTRATION", ticketId: "AKT-2026-000103", detail: "Menyetujui pendaftaran MWCNU Depok." },
  { id: "a4", timestamp: daysAgo(2, 11), actor: "reviewer@digdaya.nu.id", role: "Reviewer", action: "REJECT_REGISTRATION", ticketId: "AKT-2026-000106", detail: "Menolak pendaftaran Ranting NU Maguwoharjo." },
];
