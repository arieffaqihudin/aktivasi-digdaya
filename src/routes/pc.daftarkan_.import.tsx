import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { actions, useStore } from "@/lib/store";
import { pcDemoTargets } from "@/lib/demo-scope-data";
import { mockSuratTugasDigdaya, type Registration, type TipeOrg, type DokumenSistem } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronRight,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileSpreadsheet,
  X,
  Loader2,
  Pencil,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PENGURUS_POSITIONS } from "@/components/forms/AdministratorForm";
import {
  isValidEmail,
  isValidNIK,
  isValidWaLocal,
  normalizeWaLocal,
  formatWaStored,
  getEmailTypoSuggestion,
} from "@/utils/validation";

export const Route = createFileRoute("/pc/daftarkan_/import")({
  component: PCImportAdministratorPage,
});

// ============================================================
// Types
// ============================================================
type RowStatus = "Valid" | "Perlu Konfirmasi" | "Error" | "Dikeluarkan";

interface ParsedRow {
  id: string;
  tipeOrg: "MWC" | "Lembaga PC";
  namaExcel: string;
  /** id master organisasi (target) bila berhasil dipetakan */
  mappedTargetId: string | null;
  /** rekomendasi sistem (untuk Possible Match) */
  recommendationId: string | null;
  namaAdmin: string;
  administratorType: "Pengurus" | "Staf" | "";
  jabatan: string;
  nik: string;
  /** local WA (tanpa +62) */
  waLocal: string;
  email: string;
  nomorSurat: string;
  /** dokumen sistem ditemukan */
  surat?: DokumenSistem;
  status: RowStatus;
  notes: string[];
}

// ============================================================
// Master data PC Kraksaan (subset dari pcDemoTargets)
// ============================================================
const MWC_MASTER = pcDemoTargets.filter((t) => t.type === "MWC");
const LEMBAGA_MASTER = pcDemoTargets.filter((t) => t.type === "Lembaga PC");

/** Normalisasi untuk matching. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’`.,/]/g, " ")
    .replace(/\bpcnu\s+kraksaan\b/g, "")
    .replace(/\bnu\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Levenshtein distance untuk fuzzy match. */
function dist(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[m][n];
}

/** Cari kandidat master berdasarkan tipe + nama Excel. */
function matchOrg(tipe: "MWC" | "Lembaga PC", name: string) {
  const pool = tipe === "MWC" ? MWC_MASTER : LEMBAGA_MASTER;
  const target = norm(name);
  if (!target) return { exact: null as null | typeof pool[number], best: null as null | typeof pool[number], score: Infinity };
  // exact
  const exact = pool.find((p) => norm(p.name) === target) ?? null;
  if (exact) return { exact, best: exact, score: 0 };
  // fuzzy: best score
  let best: typeof pool[number] | null = null;
  let score = Infinity;
  for (const p of pool) {
    const d = dist(target, norm(p.name));
    if (d < score) {
      score = d;
      best = p;
    }
  }
  return { exact: null, best, score };
}

/** Cari dokumen surat tugas dari mock berdasarkan Nomor Surat / Letter ID. */
function findSurat(input: string): DokumenSistem | undefined {
  const q = input.trim();
  if (!q) return undefined;
  return mockSuratTugasDigdaya.find(
    (d) => d.nomorSurat === q || d.letterId === q || d.documentId === q,
  );
}

// ============================================================
// Mock parsed rows (dipakai saat user klik "Proses File")
// ============================================================
function mockParse(): Omit<ParsedRow, "id" | "mappedTargetId" | "recommendationId" | "surat" | "status" | "notes">[] {
  return [
    {
      tipeOrg: "MWC",
      namaExcel: "MWCNU Banyuanyar",
      namaAdmin: "Ahmad Subhan",
      administratorType: "Pengurus",
      jabatan: "Sekretaris",
      nik: "3507123456789012",
      waLocal: "81123456789",
      email: "ahmad.subhan@gmail.com",
      nomorSurat: "201/PC.13/A.I.06.03/05/2026",
    },
    {
      tipeOrg: "MWC",
      namaExcel: "MWC Banyuanyar",
      namaAdmin: "Ahmad Fauzan",
      administratorType: "Pengurus",
      jabatan: "Ketua",
      nik: "3507123456789013",
      waLocal: "81234567890",
      email: "ahmad.fauzan@gmail.com",
      nomorSurat: "202/PC.13/A.I.06.03/05/2026",
    },
    {
      tipeOrg: "Lembaga PC",
      namaExcel: "LDNU",
      namaAdmin: "Fatimah Zahra",
      administratorType: "Pengurus",
      jabatan: "Ketua",
      nik: "3507123456789014",
      waLocal: "81345678901",
      email: "fatimah.zahra@gmail.com",
      nomorSurat: "332/PB.01/A.II.06.03/99/05/2026",
    },
    {
      tipeOrg: "MWC",
      namaExcel: "MWCNU Banyuwangi",
      namaAdmin: "Hasan Basri",
      administratorType: "Pengurus",
      jabatan: "Sekretaris",
      nik: "3507123456789015",
      waLocal: "81456789012",
      email: "hasan.basri@gmail.com",
      nomorSurat: "201/PC.13/A.I.06.03/05/2026",
    },
    {
      tipeOrg: "Lembaga PC",
      namaExcel: "LAZISNU",
      namaAdmin: "Siti Aminah",
      administratorType: "Staf",
      jabatan: "Admin Sekretariat",
      nik: "3507ABC",
      waLocal: "81567890123",
      email: "siti.aminah@gmail.com",
      nomorSurat: "202/PC.13/A.I.06.03/05/2026",
    },
    {
      tipeOrg: "MWC",
      namaExcel: "MWCNU Gading",
      namaAdmin: "Muhammad Rafi",
      administratorType: "Pengurus",
      jabatan: "Bendahara",
      nik: "3507123456789016",
      waLocal: "81678901234",
      email: "muhammad.rafi@gmail.com",
      nomorSurat: "SURAT-TIDAK-ADA",
    },
  ];
}

// ============================================================
// Validation per row (mempertimbangkan org existing & duplikasi internal)
// ============================================================
function validateRow(
  row: ParsedRow,
  ctx: {
    productionNames: Set<string>;
    activeNames: Set<string>;
    usedTargetIds: Set<string>;
  },
): { status: RowStatus; notes: string[]; recommendationId: string | null; mappedTargetId: string | null; surat?: DokumenSistem } {
  // User-excluded rows tetap dikeluarkan.
  if (row.status === "Dikeluarkan") {
    return { status: "Dikeluarkan", notes: row.notes, recommendationId: row.recommendationId, mappedTargetId: row.mappedTargetId, surat: row.surat };
  }
  const notes: string[] = [];
  let recommendationId = row.recommendationId;
  let mappedTargetId = row.mappedTargetId;

  // --- Org mapping ---
  if (!mappedTargetId) {
    const m = matchOrg(row.tipeOrg, row.namaExcel);
    if (m.exact) {
      mappedTargetId = m.exact.id;
      recommendationId = null;
    } else if (m.best && m.score <= Math.max(4, Math.floor(norm(m.best.name).length / 3))) {
      recommendationId = m.best.id;
    } else {
      notes.push("Nama organisasi tidak ditemukan di bawah PCNU Kraksaan.");
    }
  }

  // Final org for status checks
  const finalTarget = mappedTargetId
    ? pcDemoTargets.find((t) => t.id === mappedTargetId)
    : null;

  let orgError = false;
  if (finalTarget) {
    if (ctx.productionNames.has(finalTarget.name)) {
      notes.push("Organisasi sudah production.");
      orgError = true;
    } else if (ctx.activeNames.has(finalTarget.name)) {
      notes.push("Organisasi sudah memiliki pengajuan aktif.");
      orgError = true;
    } else if (ctx.usedTargetIds.has(finalTarget.id)) {
      notes.push("Organisasi sudah dipakai oleh row lain di batch ini.");
      orgError = true;
    }
  }

  // --- Admin validation ---
  let adminErr = false;
  if (!row.namaAdmin.trim() || row.namaAdmin.trim().length < 3) {
    notes.push("Nama administrator minimal 3 karakter.");
    adminErr = true;
  }
  if (!row.administratorType) {
    notes.push("Jenis jabatan wajib (Pengurus / Staf).");
    adminErr = true;
  } else if (row.administratorType === "Pengurus" && !PENGURUS_POSITIONS.includes(row.jabatan as never)) {
    notes.push("Jabatan pengurus tidak valid.");
    adminErr = true;
  } else if (row.administratorType === "Staf" && !row.jabatan.trim()) {
    notes.push("Jabatan staf wajib diisi.");
    adminErr = true;
  }
  if (!isValidNIK(row.nik)) {
    notes.push("NIK harus 16 digit angka.");
    adminErr = true;
  }
  if (!isValidWaLocal(normalizeWaLocal(row.waLocal))) {
    notes.push("Format WhatsApp belum sesuai.");
    adminErr = true;
  }
  if (!isValidEmail(row.email)) {
    notes.push("Format email belum sesuai.");
    adminErr = true;
  } else {
    const typo = getEmailTypoSuggestion(row.email);
    if (typo) notes.push(`Domain email mungkin typo (mungkin: ${typo}).`);
  }

  // --- Surat tugas validation ---
  const surat = findSurat(row.nomorSurat);
  let suratErr = false;
  if (!row.nomorSurat.trim()) {
    notes.push("Nomor Surat / Letter ID wajib diisi.");
    suratErr = true;
  } else if (!surat) {
    notes.push("Surat tugas tidak ditemukan di Digdaya Persuratan.");
    suratErr = true;
  }

  // --- Final status ---
  let status: RowStatus;
  if (orgError || adminErr || suratErr) status = "Error";
  else if (!mappedTargetId && recommendationId) status = "Perlu Konfirmasi";
  else if (!mappedTargetId) status = "Error";
  else status = "Valid";

  return { status, notes, recommendationId, mappedTargetId, surat };
}

// ============================================================
// CSV Template
// ============================================================
function downloadTemplate() {
  const headers = [
    "Tipe Organisasi",
    "Nama Organisasi",
    "Nama Administrator",
    "Jenis Jabatan",
    "Jabatan",
    "NIK",
    "WhatsApp",
    "Email",
    "Nomor Surat / Letter ID",
  ];
  const rows = [
    ["MWC", "MWCNU Banyuanyar", "Ahmad Subhan", "Pengurus", "Sekretaris", "3507123456789012", "81123456789", "ahmad.subhan@gmail.com", "201/PC.13/A.I.06.03/05/2026"],
    ["Lembaga PC", "LDNU", "Fatimah Zahra", "Pengurus", "Ketua", "3507987654321098", "81234567890", "fatimah.zahra@gmail.com", "202/PC.13/A.I.06.03/05/2026"],
  ];
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template-import-admin-pc.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================
// Components
// ============================================================
function Breadcrumb() {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      <Link to="/pc" className="hover:text-foreground">PCNU Kraksaan</Link>
      <ChevronRight className="h-3 w-3 shrink-0" />
      <Link to="/pc/daftarkan" className="hover:text-foreground">Daftarkan Organisasi</Link>
      <ChevronRight className="h-3 w-3 shrink-0" />
      <span className="text-foreground">Import Data Administrator</span>
    </nav>
  );
}

function Stepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  const steps = [
    { n: 1, label: "Download Template" },
    { n: 2, label: "Upload Excel" },
    { n: 3, label: "Review & Validasi" },
    { n: 4, label: "Submit Batch" },
  ];
  return (
    <div className="-mx-1 overflow-x-auto pb-1">
      <ol className="inline-flex min-w-full items-center gap-2 px-1 sm:gap-3">
        {steps.map((s, i) => {
          const active = s.n === current;
          const done = s.n < current;
          return (
            <li key={s.n} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  done && "bg-success text-success-foreground",
                  active && "bg-primary text-primary-foreground",
                  !done && !active && "bg-muted text-muted-foreground",
                )}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : s.n}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-xs sm:text-sm",
                  active ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StatusBadge({ status }: { status: RowStatus }) {
  const map: Record<RowStatus, string> = {
    Valid: "bg-success/15 text-success",
    "Perlu Konfirmasi": "bg-warning/15 text-warning",
    Error: "bg-destructive/15 text-destructive",
    Dikeluarkan: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium", map[status])}>
      {status}
    </span>
  );
}

// ============================================================
// Edit Row Dialog
// ============================================================
function EditRowDialog({
  row,
  open,
  onClose,
  onSave,
}: {
  row: ParsedRow | null;
  open: boolean;
  onClose: () => void;
  onSave: (next: ParsedRow) => void;
}) {
  const [draft, setDraft] = useState<ParsedRow | null>(row);
  // sync when row changes
  useMemo(() => setDraft(row), [row]);

  if (!draft) return null;
  const pool = draft.tipeOrg === "MWC" ? MWC_MASTER : LEMBAGA_MASTER;
  const set = <K extends keyof ParsedRow>(k: K, v: ParsedRow[K]) =>
    setDraft({ ...draft, [k]: v });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Row Import</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Tipe Organisasi</Label>
              <Select value={draft.tipeOrg} onValueChange={(v) => set("tipeOrg", v as "MWC" | "Lembaga PC")}>
                <SelectTrigger className="mt-1 h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MWC">MWC</SelectItem>
                  <SelectItem value="Lembaga PC">Lembaga PC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Mapping Organisasi</Label>
              <Select
                value={draft.mappedTargetId ?? ""}
                onValueChange={(v) => set("mappedTargetId", v)}
              >
                <SelectTrigger className="mt-1 h-10"><SelectValue placeholder="Pilih organisasi…" /></SelectTrigger>
                <SelectContent>
                  {pool.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Nama di Excel</Label>
            <Input value={draft.namaExcel} onChange={(e) => set("namaExcel", e.target.value)} className="mt-1 h-10" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Nama Administrator</Label>
              <Input value={draft.namaAdmin} onChange={(e) => set("namaAdmin", e.target.value)} className="mt-1 h-10" />
            </div>
            <div>
              <Label className="text-xs">Jenis Jabatan</Label>
              <Select
                value={draft.administratorType || ""}
                onValueChange={(v) => setDraft({ ...draft, administratorType: v as "Pengurus" | "Staf", jabatan: "" })}
              >
                <SelectTrigger className="mt-1 h-10"><SelectValue placeholder="Pilih…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pengurus">Pengurus</SelectItem>
                  <SelectItem value="Staf">Staf</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Jabatan</Label>
            {draft.administratorType === "Pengurus" ? (
              <Select value={draft.jabatan} onValueChange={(v) => set("jabatan", v)}>
                <SelectTrigger className="mt-1 h-10"><SelectValue placeholder="Pilih jabatan…" /></SelectTrigger>
                <SelectContent>
                  {PENGURUS_POSITIONS.map((j) => (
                    <SelectItem key={j} value={j}>{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={draft.jabatan} onChange={(e) => set("jabatan", e.target.value)} className="mt-1 h-10" />
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">NIK</Label>
              <Input value={draft.nik} onChange={(e) => set("nik", e.target.value.replace(/\D/g, "").slice(0, 16))} className="mt-1 h-10" />
            </div>
            <div>
              <Label className="text-xs">WhatsApp (tanpa +62)</Label>
              <Input value={draft.waLocal} onChange={(e) => set("waLocal", e.target.value)} className="mt-1 h-10" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={draft.email} onChange={(e) => set("email", e.target.value)} className="mt-1 h-10" />
            </div>
            <div>
              <Label className="text-xs">Nomor Surat / Letter ID</Label>
              <Input value={draft.nomorSurat} onChange={(e) => set("nomorSurat", e.target.value)} className="mt-1 h-10" />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={() => draft && onSave(draft)}>Simpan & Validasi Ulang</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Main Page
// ============================================================
function PCImportAdministratorPage() {
  const navigate = useNavigate();
  const regs = useStore((s) => s.registrations);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [editRow, setEditRow] = useState<ParsedRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ submitted: number; excluded: number; errors: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Pre-compute org status context
  const ctxRefs = useMemo(() => {
    const latest = new Map<string, Registration>();
    for (const r of regs) {
      if (r.sumberPengajuan !== "PC_DASHBOARD") continue;
      const prev = latest.get(r.namaOrg);
      if (!prev || new Date(r.submittedAt) > new Date(prev.submittedAt)) latest.set(r.namaOrg, r);
    }
    const productionNames = new Set<string>();
    const activeNames = new Set<string>();
    latest.forEach((r, name) => {
      if (r.status === "Approved") productionNames.add(name);
      else if (r.status === "Pending" || r.status === "PerluPerbaikan") activeNames.add(name);
    });
    return { productionNames, activeNames };
  }, [regs]);

  function runValidation(input: ParsedRow[]): ParsedRow[] {
    const usedTargetIds = new Set<string>();
    // First pass: claim any explicit mappedTargetId
    for (const r of input) {
      if (r.status !== "Dikeluarkan" && r.mappedTargetId) usedTargetIds.add(r.mappedTargetId);
    }
    return input.map((r) => {
      // Recompute, but exclude self when checking duplicates
      const selfId = r.mappedTargetId;
      const used = new Set(usedTargetIds);
      if (selfId) used.delete(selfId);
      const v = validateRow(r, { ...ctxRefs, usedTargetIds: used });
      return { ...r, ...v };
    });
  }

  function handleFileSelect(f: File) {
    const ok = /\.(xlsx|xls|csv)$/i.test(f.name);
    if (!ok) return toast.error("Format file harus .xlsx, .xls, atau .csv.");
    if (f.size > 5 * 1024 * 1024) return toast.error("Ukuran file maksimal 5MB.");
    setFile(f);
  }

  function processFile() {
    if (!file) return toast.error("File wajib diunggah.");
    const raw = mockParse();
    if (!raw.length) return toast.error("File tidak memiliki data yang dapat diproses.");
    const initial: ParsedRow[] = raw.map((r, i) => ({
      id: `row-${i + 1}`,
      mappedTargetId: null,
      recommendationId: null,
      status: "Valid",
      notes: [],
      ...r,
    }));
    setRows(runValidation(initial));
    setStep(3);
    toast.success(`${initial.length} row terbaca. Silakan review hasil validasi.`);
  }

  function updateRow(id: string, patch: Partial<ParsedRow>) {
    setRows((prev) => runValidation(prev.map((r) => (r.id === id ? { ...r, ...patch, notes: [] } : r))));
  }

  function useRecommendation(id: string) {
    const r = rows.find((x) => x.id === id);
    if (!r?.recommendationId) return;
    updateRow(id, { mappedTargetId: r.recommendationId, recommendationId: null });
  }

  function excludeRow(id: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Dikeluarkan", notes: ["Dikeluarkan oleh user."] } : r)),
    );
  }

  function reincludeRow(id: string) {
    setRows((prev) => runValidation(prev.map((r) => (r.id === id ? { ...r, status: "Valid", notes: [] } : r))));
  }

  const summary = useMemo(() => {
    const valid = rows.filter((r) => r.status === "Valid").length;
    const konfirm = rows.filter((r) => r.status === "Perlu Konfirmasi").length;
    const err = rows.filter((r) => r.status === "Error").length;
    const excl = rows.filter((r) => r.status === "Dikeluarkan").length;
    return { total: rows.length, valid, konfirm, err, excl };
  }, [rows]);

  const canSubmit = summary.valid > 0 && summary.konfirm === 0 && !submitting;

  async function submitBatch() {
    if (!canSubmit) return;
    setSubmitting(true);
    let submitted = 0;
    for (const r of rows) {
      if (r.status !== "Valid" || !r.mappedTargetId || !r.surat) continue;
      const target = pcDemoTargets.find((t) => t.id === r.mappedTargetId);
      if (!target) continue;
      const reg = actions.submitInternal({
        tipeOrg: target.type as TipeOrg,
        namaOrg: target.name,
        namaAdmin: r.namaAdmin.trim(),
        jabatan: r.jabatan.trim(),
        nik: r.nik,
        hp: formatWaStored(normalizeWaLocal(r.waLocal)),
        email: r.email.trim(),
        sumberSuratTugas: "DIGDAYA_PERSURATAN",
        dokumenSistem: r.surat,
      });
      if (reg) submitted++;
    }
    await new Promise((r) => setTimeout(r, 300));
    setResult({ submitted, excluded: summary.excl, errors: summary.err });
    setStep(4);
    setSubmitting(false);
    toast.success(`${submitted} pengajuan berhasil dikirim.`);
  }

  // -----------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------
  return (
    <div className="p-4 pb-24 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <Breadcrumb />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Import Data Administrator</h1>
            <p className="text-sm text-muted-foreground">
              Upload Excel untuk mendaftarkan banyak MWC atau Lembaga PC sekaligus.
            </p>
          </div>
          <Link
            to="/pc/daftarkan"
            className="inline-flex h-10 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground sm:h-auto"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Pilihan Jenis
          </Link>
        </div>

        <Stepper current={step === 4 && !result ? 4 : step} />

        {/* ============ STEP 1: Download Template ============ */}
        {step === 1 && (
          <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
            <div>
              <p className="text-sm font-semibold text-foreground">1. Download Template</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Isi data sesuai format template agar sistem dapat memvalidasi nama organisasi dan data administrator.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Kolom template:</p>
              <p className="mt-1 leading-relaxed">
                Tipe Organisasi · Nama Organisasi · Nama Administrator · Jenis Jabatan · Jabatan · NIK · WhatsApp · Email · Nomor Surat / Letter ID
              </p>
              <p className="mt-2">
                Untuk tahap awal, surat tugas diambil dari Digdaya Persuratan menggunakan Nomor Surat atau Letter ID.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={downloadTemplate} className="h-11 w-full sm:h-10 sm:w-auto">
                <Download className="mr-2 h-4 w-4" /> Download Template Excel
              </Button>
              <Button variant="outline" onClick={() => setStep(2)} className="h-11 w-full sm:h-10 sm:w-auto">
                Lanjut ke Upload
              </Button>
            </div>
          </section>
        )}

        {/* ============ STEP 2: Upload ============ */}
        {step === 2 && (
          <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">2. Upload File Excel</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mendukung .xlsx, .xls, dan .csv. Maksimal 5MB.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ← Step sebelumnya
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
                e.target.value = "";
              }}
            />

            {!file ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-4 py-10 text-center hover:bg-accent/30"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Klik untuk pilih file</p>
                <p className="text-xs text-muted-foreground">.xlsx, .xls, atau .csv (maks 5MB)</p>
              </button>
            ) : (
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <FileSpreadsheet className="h-8 w-8 shrink-0 text-success" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="outline" onClick={() => fileRef.current?.click()} className="h-10 w-full sm:w-auto">
                    Ganti File
                  </Button>
                  <Button onClick={processFile} className="h-10 w-full sm:w-auto">
                    Proses File
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ============ STEP 3: Review & Validasi ============ */}
        {step === 3 && (
          <section className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <p className="text-sm font-semibold text-foreground">3. Review & Validasi Data</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pastikan nama organisasi sesuai dengan master data PCNU Kraksaan sebelum mengirim pengajuan.
              </p>

              {/* Summary */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {[
                  { label: "Total Row", value: summary.total, tone: "" },
                  { label: "Valid", value: summary.valid, tone: "text-success" },
                  { label: "Perlu Konfirmasi", value: summary.konfirm, tone: "text-warning" },
                  { label: "Error", value: summary.err, tone: "text-destructive" },
                  { label: "Dikeluarkan", value: summary.excl, tone: "text-muted-foreground" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-border bg-background p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    <p className={cn("mt-1 text-xl font-semibold text-foreground", s.tone)}>{s.value}</p>
                  </div>
                ))}
              </div>

              {summary.err > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-foreground">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <p>Row yang error tidak akan dikirim. Anda tetap dapat mengirim row Valid.</p>
                </div>
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
              <table className="w-full min-w-[1200px] text-sm">
                <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Tipe</th>
                    <th className="px-3 py-2.5">Nama di Excel</th>
                    <th className="px-3 py-2.5">Rekomendasi / Mapping</th>
                    <th className="px-3 py-2.5">Administrator</th>
                    <th className="px-3 py-2.5">Jabatan</th>
                    <th className="px-3 py-2.5">NIK</th>
                    <th className="px-3 py-2.5">WhatsApp</th>
                    <th className="px-3 py-2.5">Email</th>
                    <th className="px-3 py-2.5">Surat Tugas</th>
                    <th className="px-3 py-2.5">Catatan</th>
                    <th className="px-3 py-2.5">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const mapped = r.mappedTargetId ? pcDemoTargets.find((t) => t.id === r.mappedTargetId) : null;
                    const rec = r.recommendationId ? pcDemoTargets.find((t) => t.id === r.recommendationId) : null;
                    return (
                      <tr key={r.id} className="border-t border-border align-top">
                        <td className="px-3 py-2.5"><StatusBadge status={r.status} /></td>
                        <td className="px-3 py-2.5 text-foreground">{r.tipeOrg}</td>
                        <td className="px-3 py-2.5 text-foreground">{r.namaExcel}</td>
                        <td className="px-3 py-2.5">
                          {mapped ? (
                            <span className="text-foreground">{mapped.name}</span>
                          ) : rec ? (
                            <div className="text-xs">
                              <p className="text-warning">{rec.name}</p>
                              <p className="text-muted-foreground">Cek apakah sesuai.</p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-foreground">{r.namaAdmin}</td>
                        <td className="px-3 py-2.5 text-foreground">
                          <div>{r.jabatan || "—"}</div>
                          <div className="text-[11px] text-muted-foreground">{r.administratorType || "—"}</div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs">{r.nik}</td>
                        <td className="px-3 py-2.5 font-mono text-xs">{r.waLocal && `+62${normalizeWaLocal(r.waLocal)}`}</td>
                        <td className="px-3 py-2.5 text-xs">{r.email}</td>
                        <td className="px-3 py-2.5 text-xs">
                          {r.surat ? (
                            <div>
                              <p className="text-foreground">{r.surat.nomorSurat}</p>
                              <p className="text-[11px] text-success">Terambil dari Digdaya Persuratan</p>
                            </div>
                          ) : (
                            <p className="text-destructive">{r.nomorSurat || "—"}</p>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">
                          {r.notes.length === 0 ? "—" : (
                            <ul className="list-disc pl-4">
                              {r.notes.map((n, i) => <li key={i}>{n}</li>)}
                            </ul>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col gap-1">
                            {r.status === "Perlu Konfirmasi" && r.recommendationId && (
                              <button
                                onClick={() => useRecommendation(r.id)}
                                className="rounded border border-primary px-2 py-1 text-[11px] text-primary hover:bg-primary/5"
                              >
                                Gunakan Rekomendasi
                              </button>
                            )}
                            <button
                              onClick={() => setEditRow(r)}
                              className="inline-flex items-center justify-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-foreground hover:bg-accent/30"
                            >
                              <Pencil className="h-3 w-3" /> Edit
                            </button>
                            {r.status !== "Dikeluarkan" ? (
                              <button
                                onClick={() => excludeRow(r.id)}
                                className="rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent/30"
                              >
                                Keluarkan
                              </button>
                            ) : (
                              <button
                                onClick={() => reincludeRow(r.id)}
                                className="inline-flex items-center justify-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-foreground hover:bg-accent/30"
                              >
                                <RefreshCcw className="h-3 w-3" /> Masukkan Lagi
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: card list */}
            <div className="space-y-3 md:hidden">
              {rows.map((r) => {
                const mapped = r.mappedTargetId ? pcDemoTargets.find((t) => t.id === r.mappedTargetId) : null;
                const rec = r.recommendationId ? pcDemoTargets.find((t) => t.id === r.recommendationId) : null;
                return (
                  <div key={r.id} className="space-y-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{r.namaExcel}</p>
                        <p className="text-xs text-muted-foreground">{r.tipeOrg}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    {mapped && <p className="text-xs text-foreground">→ {mapped.name}</p>}
                    {rec && !mapped && <p className="text-xs text-warning">Rekomendasi: {rec.name}</p>}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Admin:</span> {r.namaAdmin}</div>
                      <div><span className="text-muted-foreground">Jabatan:</span> {r.jabatan || "—"}</div>
                      <div><span className="text-muted-foreground">NIK:</span> <span className="font-mono">{r.nik}</span></div>
                      <div><span className="text-muted-foreground">WA:</span> <span className="font-mono">+62{normalizeWaLocal(r.waLocal)}</span></div>
                      <div className="col-span-2 truncate"><span className="text-muted-foreground">Email:</span> {r.email}</div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Surat:</span>{" "}
                        {r.surat ? (
                          <span className="text-success">{r.surat.nomorSurat}</span>
                        ) : (
                          <span className="text-destructive">{r.nomorSurat || "—"}</span>
                        )}
                      </div>
                    </div>
                    {r.notes.length > 0 && (
                      <ul className="list-disc rounded-md bg-secondary/40 p-3 pl-6 text-xs text-muted-foreground">
                        {r.notes.map((n, i) => <li key={i}>{n}</li>)}
                      </ul>
                    )}
                    <div className="flex flex-col gap-2">
                      {r.status === "Perlu Konfirmasi" && r.recommendationId && (
                        <Button onClick={() => useRecommendation(r.id)} className="h-10 w-full">Gunakan Rekomendasi</Button>
                      )}
                      <Button variant="outline" onClick={() => setEditRow(r)} className="h-10 w-full">
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                      </Button>
                      {r.status !== "Dikeluarkan" ? (
                        <Button variant="ghost" onClick={() => excludeRow(r.id)} className="h-10 w-full text-muted-foreground">
                          Keluarkan dari Import
                        </Button>
                      ) : (
                        <Button variant="ghost" onClick={() => reincludeRow(r.id)} className="h-10 w-full">
                          <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Masukkan Lagi
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit bar */}
            <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/95 p-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Data yang valid akan langsung dikirim. Data yang error tidak akan diproses.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="outline" onClick={() => { setRows([]); setFile(null); setStep(2); }} className="h-11 w-full sm:h-10 sm:w-auto">
                    Upload Ulang
                  </Button>
                  <Button onClick={submitBatch} disabled={!canSubmit} className="h-11 w-full sm:h-10 sm:w-auto">
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Kirim Semua Pengajuan Valid ({summary.valid})
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============ STEP 4: Success ============ */}
        {step === 4 && result && (
          <section className="space-y-4 rounded-xl border border-border bg-card p-6 text-center sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Import Berhasil Diproses</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ringkasan hasil batch import administrator.
              </p>
            </div>
            <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-[11px] uppercase text-muted-foreground">Terkirim</p>
                <p className="mt-1 text-2xl font-semibold text-success">{result.submitted}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-[11px] uppercase text-muted-foreground">Dikeluarkan</p>
                <p className="mt-1 text-2xl font-semibold text-muted-foreground">{result.excluded}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-[11px] uppercase text-muted-foreground">Error</p>
                <p className="mt-1 text-2xl font-semibold text-destructive">{result.errors}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={() => navigate({ to: "/pc/status-pengajuan" })} className="h-11 sm:h-10">
                Lihat Status Pengajuan
              </Button>
              <Button
                variant="outline"
                onClick={() => { setStep(1); setFile(null); setRows([]); setResult(null); }}
                className="h-11 sm:h-10"
              >
                Import Lagi
              </Button>
            </div>
          </section>
        )}

        <EditRowDialog
          row={editRow}
          open={!!editRow}
          onClose={() => setEditRow(null)}
          onSave={(next) => {
            setEditRow(null);
            updateRow(next.id, next);
          }}
        />
      </div>
    </div>
  );
}
