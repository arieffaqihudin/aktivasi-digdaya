## Scope

Refactor cukup besar — menyentuh data model, store, routes publik, dashboard internal, dan inbox reviewer. Untuk tetap fokus dan terkontrol, saya kelompokkan jadi 6 area kerja berikut.

## 1. Data model & mock data (`src/data/mockData.ts`)

- Tambah tipe `Tingkat = "PW" | "PC"` dan `StatusOrg = "Belum Production" | "Pending Aktivasi" | "Production"`.
- Tambah `SumberSuratTugas = "DIGDAYA_PERSURATAN" | "MANUAL_UPLOAD"` dan `SumberPengajuan = "PUBLIC" | "PW_DASHBOARD" | "PC_DASHBOARD"`.
- Tambah `MasterPW` (5–6 PW dummy) dengan `statusOrg`. Update `MasterPC` dengan `statusOrg` (bukan hanya `aktif`).
- Tambah `TipeOrg`: `"PW" | "Lembaga PW" | "MWC" | "PC" | "Lembaga PC" | "Ranting"`.
- Tambah `Registration.sumberPengajuan`, `sumberSuratTugas`, `dokumenSistem?: { documentId; nomorSurat; namaDokumen; tanggalSurat; penandatangan }`, `sourcePwId?`, `sourcePwName?`, `tingkatPendaftar: "PW"|"PC"`.
- `AccessCode` dapat tingkat `"PW"|"PC"` dan tetap merujuk ke organisasi (PW/PC) yang **belum production**.
- Tambah seed `mockSuratTugasDigdaya` (8–12 dokumen Digdaya Persuratan untuk pencarian).
- Tambah seed PW (mis. `pw-jatim` belum production, `pw-jogja` production) dan PC production user demo (`pc-sleman`), serta PW production user demo.

## 2. Store (`src/lib/store.ts`)

- `Role` jadi `"Super Admin" | "Reviewer" | "PC" | "PW"`.
- `User` tambahkan `pwId?`, `pwName?`.
- `verifyAccessCode` cek tingkat (PW/PC) dan kembalikan info organisasi + tingkat.
- `submitPublicActivation` (gantikan `submitJalurA`) untuk PW/PC belum production via kode akses — wajib `MANUAL_UPLOAD`.
- `submitInternal` (gantikan `submitJalurB`) untuk PW/PC production — terima `sumberSuratTugas` + payload sesuai (file ATAU `dokumenSistem`).
- `approve`: setelah approve aktivasi publik, set `statusOrg` organisasi terkait → `"Production"`.
- `generateAccessCodes`: filter hanya organisasi `statusOrg !== "Production"`; mendukung tingkat PW/PC.
- `login`: tambahkan akun demo `pw@digdaya.nu.id` → role PW.
- `searchSuratTugasSistem(query)`: util untuk PublicForms/internal — cari di `mockSuratTugasDigdaya`.

## 3. Route publik (`/`, `/aktivasi`, `/cek-status`)

- Tab `/` jadi "Aktivasi PW/PC" + "Cek Status".
- `AktivasiForm` tampilkan tingkat (PW/PC) + wilayah + masa berlaku setelah verifikasi kode. Tidak ada opsi "ambil dari sistem" — upload manual wajib.
- Copy header diganti: "Portal ini digunakan untuk PW/PC yang belum aktif di Digdaya…".

## 4. Dashboard internal — tambah PW & revisi PC

- Tambah `src/routes/pw.tsx` (layout), `pw.index.tsx` (overview), `pw.daftarkan.tsx`, `pw.status-pengajuan.tsx`, `pw.profil.tsx`.
- PC `daftarkan`: tipe organisasi = MWC / Lembaga PC / Ranting. PW `daftarkan`: tipe = PC / MWC / Lembaga PW.
- Komponen baru `src/components/internal/SuratTugasPicker.tsx` dengan dua mode:
  - **Ambil dari Digdaya Persuratan** — combobox search → preview metadata (nomor surat, judul, tanggal, penandatangan, link).
  - **Upload Surat Tugas Baru** — file PDF/JPG/PNG ≤5MB.
  - Validasi salah satu wajib dipilih.
- Login redirect: role PW → `/pw`, PC → `/pc`, Reviewer → `/review`, Super Admin → `/admin`.

## 5. Reviewer inbox (`src/routes/review.inbox.tsx`, `review.inbox.$ticketId.tsx`)

- Filter baru: Sumber Pengajuan, Tingkat Pendaftar, Sumber Surat Tugas.
- Kolom tabel: Nomor Tiket · Sumber Pengajuan · Pendaftar · Tipe Org · Nama Org · Administrator · Sumber Surat Tugas · Tgl · Status · SLA · Aksi.
- Detail review: jika `DIGDAYA_PERSURATAN` tampilkan kartu metadata + tombol "Lihat Dokumen"; jika `MANUAL_UPLOAD` tampilkan preview file.
- Badge `SumberPengajuanBadge` & `SumberSuratBadge` baru.

## 6. Super Admin kode akses (`src/routes/admin.access-codes.tsx`)

- Selector tingkat PW/PC saat generate.
- List organisasi yang **belum production** saja.
- Tabel tambahkan kolom Tingkat.

## Yang tidak diubah

- Sidebar Digdaya Persuratan styling, layout 2-kolom login, logo, audit log, SLA monitoring, Peruri export — tetap.
- Komponen UI (badge JalurA/B) di-rename/tambahkan jadi `SumberPengajuanBadge` (Public / PW Dashboard / PC Dashboard) untuk konsistensi label, namun field `jalur` legacy boleh dihapus sepenuhnya.

## Catatan teknis

- Semua perubahan tetap di frontend (mock store via localStorage) — belum menyentuh Cloud/Supabase.
- `STORAGE_KEY` di store dinaikkan ke `v3` agar state lama yang inkonsisten ter-reset otomatis.
- Akun demo baru ditampilkan di `<details>` halaman login: Super Admin / Reviewer / PC / **PW**.

Setelah disetujui, saya kerjakan ke-6 area di atas dalam satu pass.