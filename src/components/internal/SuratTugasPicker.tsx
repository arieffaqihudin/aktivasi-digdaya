import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions } from "@/lib/store";
import type { DokumenSistem, SumberSuratTugas } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { FileText, Search, Upload, CheckCircle2, Database } from "lucide-react";

export interface SuratTugasValue {
  sumber: SumberSuratTugas;
  file?: File | null;
  dokumen?: DokumenSistem | null;
}

export function SuratTugasPicker({
  value,
  onChange,
}: {
  value: SuratTugasValue;
  onChange: (v: SuratTugasValue) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<DokumenSistem[]>(() => actions.searchSuratTugasSistem(""));

  const setSumber = (s: SumberSuratTugas) => {
    if (s === "DIGDAYA_PERSURATAN") onChange({ sumber: s, dokumen: value.dokumen ?? null, file: null });
    else onChange({ sumber: s, file: value.file ?? null, dokumen: null });
  };

  const doSearch = (qv: string) => {
    setQ(qv);
    setResults(actions.searchSuratTugasSistem(qv));
  };

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-muted-foreground">
        Jika surat tugas sudah dibuat melalui Digdaya Persuratan, pilih dokumen dari sistem. Jika belum, unggah file surat tugas secara manual.
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <ModeCard
          active={value.sumber === "DIGDAYA_PERSURATAN"}
          onClick={() => setSumber("DIGDAYA_PERSURATAN")}
          icon={Database}
          title="Gunakan Surat Tugas dari Sistem"
          subtitle="Ambil dari Digdaya Persuratan"
        />
        <ModeCard
          active={value.sumber === "MANUAL_UPLOAD"}
          onClick={() => setSumber("MANUAL_UPLOAD")}
          icon={Upload}
          title="Upload Surat Tugas Baru"
          subtitle="PDF/JPG/PNG, maks 5MB"
        />
      </div>

      {value.sumber === "DIGDAYA_PERSURATAN" && (
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nomor surat, judul, atau penandatangan…"
              value={q}
              onChange={(e) => doSearch(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {results.map((d) => {
              const picked = value.dokumen?.documentId === d.documentId;
              return (
                <button
                  type="button"
                  key={d.documentId}
                  onClick={() => onChange({ ...value, dokumen: d })}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors",
                    picked
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-secondary/50",
                  )}
                >
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{d.namaDokumen}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {d.nomorSurat} · {new Date(d.tanggalSurat).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} · {d.penandatangan}
                    </p>
                  </div>
                  {picked && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              );
            })}
            {results.length === 0 && (
              <p className="px-3 py-6 text-center text-[12px] text-muted-foreground">Tidak ada dokumen cocok.</p>
            )}
          </div>

          {value.dokumen && (
            <div className="rounded-md border border-primary/30 bg-accent/40 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-dark">Dokumen terpilih</p>
              <p className="mt-1 text-[13px] font-medium text-foreground">{value.dokumen.namaDokumen}</p>
              <p className="text-[11px] text-muted-foreground">
                {value.dokumen.nomorSurat} · {new Date(value.dokumen.tanggalSurat).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
              <Button type="button" variant="outline" size="sm" className="mt-2 h-7 text-[11px]">
                Lihat Dokumen
              </Button>
            </div>
          )}
        </div>
      )}

      {value.sumber === "MANUAL_UPLOAD" && (
        <div className="rounded-md border border-border bg-card p-4">
          <Label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Upload Surat Tugas
          </Label>
          <div className="mt-1.5 flex items-center gap-2 rounded-md border border-dashed border-border bg-secondary/30 p-3">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => onChange({ ...value, file: e.target.files?.[0] ?? null })}
              className="border-0 bg-transparent p-0 file:mr-3"
            />
          </div>
          <p className="mt-1.5 text-[12px] text-muted-foreground">Format PDF/JPG/PNG, maks 5MB.</p>
          {value.file && (
            <p className="mt-1 text-[12px] text-foreground">
              {value.file.name} · {(value.file.size / 1024).toFixed(0)} KB
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function validateSuratTugas(v: SuratTugasValue): string | null {
  if (v.sumber === "DIGDAYA_PERSURATAN") {
    if (!v.dokumen) return "Pilih dokumen surat tugas dari Digdaya Persuratan.";
  } else {
    if (!v.file) return "Upload surat tugas wajib.";
    if (v.file.size > 5 * 1024 * 1024) return "Ukuran file maksimal 5MB.";
  }
  return null;
}

function ModeCard({
  active, onClick, icon: Icon, title, subtitle,
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
    >
      <span className={cn(
        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
        active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
      )}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-foreground">{title}</span>
        <span className="block text-[11px] text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}
