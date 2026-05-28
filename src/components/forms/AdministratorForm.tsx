import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { AdministratorType } from "@/data/mockData";
import {
  formatWaStored,
  getEmailDomainSuggestions,
  getEmailTypoSuggestion,
  isValidEmail,
  isValidNIK,
  isValidWaLocal,
  normalizeWaLocal,
  parseStoredWaToLocal,
} from "@/utils/validation";

// ---------- Konstanta ----------
export const PENGURUS_POSITIONS = [
  "Ketua",
  "Wakil Ketua",
  "Sekretaris",
  "Wakil Sekretaris",
  "Bendahara",
  "Wakil Bendahara",
  "Anggota",
  "Ketua Terpilih",
  "Katib",
  "Wakil Katib",
  "Rais",
  "Wakil Rais",
  "Rais Terpilih",
  "A'wan Syuriyah",
] as const;

const PENGURUS_SET = new Set<string>(PENGURUS_POSITIONS as readonly string[]);

// ---------- Tipe ----------
export interface AdminFormValue {
  namaAdmin: string;
  administratorType: "" | AdministratorType;
  /** Jika Pengurus → opsi dropdown. Jika Staf → free text. */
  jabatan: string;
  nik: string;
  /** Bagian LOKAL nomor WA tanpa +62 (mis. 81123456789). */
  waLocal: string;
  email: string;
}

export const emptyAdminValue = (): AdminFormValue => ({
  namaAdmin: "",
  administratorType: "",
  jabatan: "",
  nik: "",
  waLocal: "",
  email: "",
});

/** Init dari Registration existing (untuk form revisi). */
export function adminFromExisting(reg: {
  namaAdmin?: string;
  jabatan?: string;
  administratorType?: AdministratorType;
  nik?: string;
  hp?: string;
  email?: string;
}): AdminFormValue {
  const jabatan = reg.jabatan ?? "";
  const inferredType: "" | AdministratorType =
    reg.administratorType ?? (PENGURUS_SET.has(jabatan) ? "Pengurus" : jabatan ? "Staf" : "");
  return {
    namaAdmin: reg.namaAdmin ?? "",
    administratorType: inferredType,
    jabatan,
    nik: reg.nik ?? "",
    waLocal: parseStoredWaToLocal(reg.hp),
    email: reg.email ?? "",
  };
}

/** Validasi → string error / null. */
export function validateAdmin(v: AdminFormValue): string | null {
  if (!v.namaAdmin.trim() || v.namaAdmin.trim().length < 3) return "Nama administrator wajib diisi.";
  if (!v.administratorType) return "Pilih jenis jabatan administrator.";
  if (v.administratorType === "Pengurus" && !v.jabatan) return "Pilih jabatan pengurus.";
  if (v.administratorType === "Staf" && !v.jabatan.trim()) return "Isi jabatan staf.";
  if (!isValidNIK(v.nik)) return "NIK harus terdiri dari 16 digit angka.";
  if (!isValidWaLocal(v.waLocal)) return "Format nomor WhatsApp belum sesuai.";
  if (!isValidEmail(v.email)) return "Format email belum sesuai.";
  return null;
}

/** Konversi ke payload submit kompatibel dengan store. */
export function adminToSubmit(v: AdminFormValue) {
  return {
    namaAdmin: v.namaAdmin.trim(),
    jabatan: v.jabatan.trim(),
    administratorType: (v.administratorType || undefined) as AdministratorType | undefined,
    nik: v.nik,
    hp: formatWaStored(v.waLocal),
    email: v.email.trim(),
  };
}

// ---------- Komponen ----------
export function AdministratorForm({
  value,
  onChange,
  headingHidden = false,
}: {
  value: AdminFormValue;
  onChange: (v: AdminFormValue) => void;
  headingHidden?: boolean;
}) {
  const set = <K extends keyof AdminFormValue>(k: K, val: AdminFormValue[K]) =>
    onChange({ ...value, [k]: val });

  const [emailFocused, setEmailFocused] = useState(false);
  const domainSuggestions = useMemo(
    () => (emailFocused ? getEmailDomainSuggestions(value.email) : []),
    [value.email, emailFocused],
  );
  const typoSuggestion = useMemo(() => getEmailTypoSuggestion(value.email), [value.email]);

  const nikLen = value.nik.length;
  const nikComplete = nikLen === 16;

  return (
    <div className="space-y-4">
      {!headingHidden && (
        <p className="text-sm font-semibold text-foreground">Data Administrator</p>
      )}

      {/* 1. Nama */}
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Nama Administrator
        </Label>
        <Input
          value={value.namaAdmin}
          onChange={(e) => set("namaAdmin", e.target.value)}
          placeholder="Masukkan nama lengkap administrator"
          className="mt-1.5 h-10"
          autoComplete="name"
        />
      </div>

      {/* 2. Jabatan Administrator */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Jabatan Administrator
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {(["Pengurus", "Staf"] as const).map((opt) => {
            const active = value.administratorType === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  onChange({ ...value, administratorType: opt, jabatan: "" })
                }
                className={cn(
                  "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
                aria-pressed={active}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {value.administratorType === "Pengurus" && (
          <Select value={value.jabatan} onValueChange={(v) => set("jabatan", v)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Pilih jabatan pengurus" />
            </SelectTrigger>
            <SelectContent>
              {PENGURUS_POSITIONS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {value.administratorType === "Staf" && (
          <Input
            value={value.jabatan}
            onChange={(e) => set("jabatan", e.target.value)}
            placeholder="Contoh: Operator, Admin, Staf Sekretariat"
            className="h-10"
          />
        )}
      </div>

      {/* 3. NIK */}
      <div>
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">NIK</Label>
          <span
            className={cn(
              "text-[11px] tabular-nums",
              nikComplete ? "text-success" : "text-muted-foreground",
            )}
          >
            {nikLen}/16 digit
          </span>
        </div>
        <Input
          inputMode="numeric"
          value={value.nik}
          onChange={(e) => set("nik", e.target.value.replace(/\D/g, "").slice(0, 16))}
          placeholder="Masukkan 16 digit NIK"
          className="mt-1.5 h-10 font-mono tracking-wider"
        />
      </div>

      {/* 4. Nomor WhatsApp */}
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Nomor WhatsApp
        </Label>
        <div className="mt-1.5 flex h-10 items-stretch overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <span className="inline-flex select-none items-center border-r border-input bg-secondary px-3 text-sm font-medium text-foreground">
            +62
          </span>
          <input
            type="tel"
            inputMode="numeric"
            value={value.waLocal}
            onChange={(e) => set("waLocal", normalizeWaLocal(e.target.value))}
            placeholder="811xxxxxxx"
            className="h-full w-full min-w-0 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <p className="mt-1.5 text-[12px] text-muted-foreground">
          Gunakan nomor WhatsApp aktif. Awalan +62 sudah otomatis.
        </p>
      </div>

      {/* 5. Email */}
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
        <Input
          type="email"
          value={value.email}
          onChange={(e) => set("email", e.target.value)}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setTimeout(() => setEmailFocused(false), 150)}
          placeholder="Masukkan email administrator"
          className="mt-1.5 h-10"
          autoComplete="email"
        />
        <p className="mt-1.5 text-[12px] text-muted-foreground">
          Gunakan email aktif untuk menerima informasi aktivasi.
        </p>

        {domainSuggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {domainSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  set("email", s);
                }}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-[12px] text-foreground hover:border-primary hover:bg-primary/5"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {typoSuggestion && (
          <button
            type="button"
            onClick={() => set("email", typoSuggestion)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-warning/30 bg-warning/5 px-2.5 py-1.5 text-[12px] text-foreground"
          >
            <AlertCircle className="h-3.5 w-3.5 text-warning" />
            Mungkin maksud Anda <span className="font-medium underline">{typoSuggestion}</span>?
          </button>
        )}

        {value.email && !typoSuggestion && isValidEmail(value.email) && (
          <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-success">
            <CheckCircle2 className="h-3 w-3" /> Format email valid
          </p>
        )}
      </div>
    </div>
  );
}
