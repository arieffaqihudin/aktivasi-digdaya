import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  CheckCircle2,
  Database,
  X,
  Search,
  ExternalLink,
} from "lucide-react";
import { mockSuratTugasDigdaya, type DokumenSistem, type SumberSuratTugas } from "@/data/mockData";

export interface SuratTugasValue {
  sumber: SumberSuratTugas;
  file?: File | null;
  dokumen?: DokumenSistem | null;
}

export const emptySuratTugas = (mode: SuratTugasMode = "full"): SuratTugasValue => ({
  sumber: mode === "uploadOnly" ? "MANUAL_UPLOAD" : "DIGDAYA_PERSURATAN",
  file: null,
  dokumen: null,
});

export type SuratTugasMode = "full" | "uploadOnly";

const ACCEPT = ".pdf,.jpg,.jpeg,.png";
const MAX_SIZE = 5 * 1024 * 1024;

function findDokumen(query: string): DokumenSistem | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return (
    mockSuratTugasDigdaya.find(
      (d) =>
        (d.letterId && d.letterId.toLowerCase() === q) ||
        d.nomorSurat.toLowerCase() === q,
    ) ??
    mockSuratTugasDigdaya.find(
      (d) =>
        (d.letterId && d.letterId.toLowerCase().includes(q)) ||
        d.nomorSurat.toLowerCase().includes(q) ||
        d.namaDokumen.toLowerCase().includes(q),
    ) ??
    null
  );
}

export function SuratTugasSelector({
  value,
  onChange,
  mode = "full",
}: {
  value: SuratTugasValue;
  onChange: (v: SuratTugasValue) => void;
  mode?: SuratTugasMode;
}) {
  const [query, setQuery] = useState(value.dokumen?.letterId ?? value.dokumen?.nomorSurat ?? "");
  const [fetching, setFetching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const setSumber = (s: SumberSuratTugas) => {
    if (s === "DIGDAYA_PERSURATAN") onChange({ sumber: s, dokumen: value.dokumen ?? null, file: null });
    else onChange({ sumber: s, file: value.file ?? null, dokumen: null });
  };

  const fetchDokumen = async () => {
    if (!query.trim()) {
      toast.error("Nomor surat atau Letter ID wajib diisi.");
      return;
    }
    setFetching(true);
    setNotFound(false);
    await new Promise((r) => setTimeout(r, 250));
    const found = findDokumen(query);
    setFetching(false);
    if (!found) {
      setNotFound(true);
      onChange({ ...value, dokumen: null });
      return;
    }
    onChange({ ...value, sumber: "DIGDAYA_PERSURATAN", dokumen: found, file: null });
    toast.success("Dokumen berhasil diambil dari Digdaya Persuratan.");
  };

  const handleFile = (f: File | null) => {
    if (!f) return onChange({ ...value, file: null });
    if (f.size > MAX_SIZE) {
      toast.error("Ukuran file maksimal 5MB.");
      return;
    }
    const okType = /\.(pdf|jpe?g|png)$/i.test(f.name);
    if (!okType) {
      toast.error("Format file harus PDF, JPG, atau PNG.");
      return;
    }
    onChange({ ...value, sumber: "MANUAL_UPLOAD", file: f, dokumen: null });
  };

  return (
    <div className="space-y-3">
      {mode === "full" ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <ModeCard
            active={value.sumber === "DIGDAYA_PERSURATAN"}
            onClick={() => setSumber("DIGDAYA_PERSURATAN")}
            icon={Database}
            title="Ambil dari Digdaya Persuratan"
            subtitle="Cari berdasarkan Nomor Surat / Letter ID"
          />
          <ModeCard
            active={value.sumber === "MANUAL_UPLOAD"}
            onClick={() => setSumber("MANUAL_UPLOAD")}
            icon={Upload}
            title="Upload Surat Tugas Baru"
            subtitle="PDF/JPG/PNG, maks 5MB"
          />
        </div>
      ) : (
        <p className="text-[12px] text-muted-foreground">
          Karena organisasi belum aktif di Digdaya, surat tugas hanya dapat diunggah manual.
        </p>
      )}

      {value.sumber === "DIGDAYA_PERSURATAN" && mode === "full" && (
        <div className="space-y-3 rounded-md border border-border bg-card p-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Nomor Surat / Letter ID
            </Label>
            <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setNotFound(false);
                  }}
                  placeholder="Masukkan nomor surat atau Letter ID"
                  className="h-10 pl-9"
                />
              </div>
              <Button type="button" onClick={fetchDokumen} disabled={fetching} className="h-10 w-full sm:w-auto">
                {fetching ? "Mengambil…" : "Ambil Dokumen"}
              </Button>
            </div>
          </div>

          {notFound && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-[12px] text-destructive">
              Dokumen tidak ditemukan di Digdaya Persuratan.
            </div>
          )}

          {value.dokumen && (
            <DokumenCard
              dokumen={value.dokumen}
              onReset={() => {
                onChange({ ...value, dokumen: null });
                setQuery("");
              }}
            />
          )}
        </div>
      )}

      {value.sumber === "MANUAL_UPLOAD" && (
        <div className="rounded-md border border-border bg-card p-4">
          {!value.file ? (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-secondary/30 p-6 text-center hover:bg-secondary/50">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Klik untuk pilih file</span>
              <span className="text-[11px] text-muted-foreground">Format PDF/JPG/PNG · maks 5MB</span>
              <input
                type="file"
                accept={ACCEPT}
                className="sr-only"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </label>
          ) : (
            <div className="space-y-3">
              <FilePreview file={value.file} />
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/50">
                  Ganti File
                  <input
                    type="file"
                    accept={ACCEPT}
                    className="sr-only"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onChange({ ...value, file: null })}
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Hapus File
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function validateSuratTugas(v: SuratTugasValue): string | null {
  if (v.sumber === "DIGDAYA_PERSURATAN") {
    if (!v.dokumen) return "Ambil dokumen terlebih dahulu sebelum mengirim pengajuan.";
  } else {
    if (!v.file) return "Surat tugas wajib diunggah.";
    if (v.file.size > 5 * 1024 * 1024) return "Ukuran file maksimal 5MB.";
  }
  return null;
}

// ---------- Internal ----------
function ModeCard({
  active,
  onClick,
  icon: Icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-md border p-3.5 text-left transition-colors",
        active
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:bg-secondary/50",
      )}
      aria-pressed={active}
    >
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
          active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-foreground">{title}</span>
        <span className="block text-[11px] text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}

function DokumenCard({ dokumen, onReset }: { dokumen: DokumenSistem; onReset: () => void }) {
  return (
    <div className="rounded-md border border-primary/30 bg-accent/40 p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary-dark">
        <CheckCircle2 className="h-3.5 w-3.5" /> Dokumen Terpilih · Digdaya Persuratan
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Info label="Nomor Surat" value={dokumen.nomorSurat} />
        <Info label="Judul" value={dokumen.namaDokumen} />
        <Info
          label="Tanggal Surat"
          value={new Date(dokumen.tanggalSurat).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        />
        <Info label="Penandatangan" value={dokumen.penandatangan} />
        <Info label="Status" value={dokumen.status} />
        {dokumen.letterId && <Info label="Letter ID" value={dokumen.letterId} mono />}
      </div>

      <div className="mt-3 flex h-32 items-center justify-center rounded-md border border-dashed border-border bg-background/60 text-[12px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Pratinjau PDF
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto">
          <ExternalLink className="mr-1 h-3.5 w-3.5" />
          Lihat PDF
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onReset} className="w-full sm:w-auto">
          Ganti Dokumen
        </Button>
      </div>
    </div>
  );
}

function FilePreview({ file }: { file: File }) {
  const isImage = /^image\//.test(file.type) || /\.(jpe?g|png)$/i.test(file.name);
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  const url = isImage ? URL.createObjectURL(file) : null;
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/30 p-3">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
          <p className="text-[11px] text-muted-foreground">
            {(file.size / 1024).toFixed(0)} KB · {isPdf ? "PDF" : isImage ? "Gambar" : file.type || "File"}
          </p>
        </div>
      </div>
      {url && (
        <img
          src={url}
          alt={file.name}
          className="max-h-48 w-full rounded-md border border-border object-contain"
        />
      )}
      {isPdf && (
        <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-[12px] text-muted-foreground">
          Pratinjau PDF tersedia setelah dikirim
        </div>
      )}
    </div>
  );
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-[12px] text-foreground", mono && "font-mono break-all")}>{value}</p>
    </div>
  );
}
