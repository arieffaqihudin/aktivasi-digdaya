import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { actions, type VerifyResult } from "@/lib/store";
import { isValidNIK, isValidEmail, normalizePhone, isValidPhone } from "@/utils/validation";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, KeyRound, Loader2, Upload, AlertCircle } from "lucide-react";
import type { AccessCode } from "@/data/mockData";

/**
 * Self-contained Aktivasi PC flow (Jalur A).
 * Used by both the homepage tab and the /aktivasi route.
 */
export function AktivasiForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [verified, setVerified] = useState<AccessCode | null>(null);

  const [namaAdmin, setNamaAdmin] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [nik, setNik] = useState("");
  const [hp, setHp] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const verify = async () => {
    if (!code.trim()) return;
    setVerifying(true);
    setCodeError(null);
    await new Promise((r) => setTimeout(r, 250));
    const res: VerifyResult = actions.verifyAccessCode(code);
    setVerifying(false);
    if (!res.ok) {
      const msg = {
        notfound: "Kode akses tidak ditemukan atau tidak valid. Silakan hubungi Tim Digdaya PBNU.",
        expired: "Kode akses sudah kedaluwarsa. Silakan minta kode akses baru.",
        used: "Kode akses ini sudah digunakan. Silakan cek status pendaftaran atau hubungi Tim Digdaya.",
        disabled: "Kode akses ini telah dinonaktifkan.",
      }[res.reason];
      setCodeError(msg);
      return;
    }
    setVerified(res.code);
    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNIK(nik)) return toast.error("NIK harus 16 digit angka.");
    if (!isValidEmail(email)) return toast.error("Format email tidak valid.");
    const normHp = normalizePhone(hp);
    if (!isValidPhone(normHp)) return toast.error("Nomor HP tidak valid.");
    if (!file) return toast.error("Upload Scan Surat Tugas wajib.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Ukuran file maksimal 5MB.");
    setHp(normHp);
    setStep(3);
  };

  const submit = async () => {
    if (!verified) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 250));
    const reg = actions.submitPublicActivation({
      accessCode: verified.code,
      namaAdmin, jabatan, nik, hp, email,
      suratTugasFile: file?.name,
    });
    setSubmitting(false);
    if (!reg) return toast.error("Gagal mengirim pendaftaran.");
    setTicketId(reg.ticketId);
    setStep(4);
  };

  const maskNik = (n: string) =>
    n.length === 16 ? n.slice(0, 4) + "********" + n.slice(-4) : n;

  return (
    <div>
      <Stepper step={step} />

      {step === 1 && (
        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="code" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Kode Akses
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => { setCode(e.target.value); setCodeError(null); }}
              placeholder="DGD-XXXX-XXXX"
              className="mt-1.5 h-11 font-mono uppercase tracking-wider"
              autoFocus
            />
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              Masukkan kode akses yang diterima dari PBNU.
            </p>
            {codeError && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-[13px] text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{codeError}</span>
              </div>
            )}
          </div>
          <Button onClick={verify} disabled={verifying || !code.trim()} className="h-11 w-full">
            {verifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
            Verifikasi Kode
          </Button>
          <details className="rounded-md border border-border bg-secondary/40 p-3 text-[12px] text-muted-foreground">
            <summary className="cursor-pointer font-medium text-foreground">Kode demo</summary>
            <p className="mt-1.5 font-mono">DGD-MN8P-3KLR · DGD-2C7J-BVQK · DGD-T5Z9-MWPE</p>
          </details>
        </div>
      )}

      {step === 2 && verified && (
        <form onSubmit={handleStep2} className="mt-6 space-y-4">
          <div className="rounded-md border border-primary/30 bg-accent p-3.5">
            <div className="flex items-center gap-2 text-[12px] font-medium text-primary-dark">
              <CheckCircle2 className="h-4 w-4" /> Kode akses valid
            </div>
            <p className="mt-2 text-[15px] font-semibold text-foreground">{verified.orgName}</p>
            <p className="text-[12px] text-muted-foreground">
              Tingkat {verified.tingkat} · {verified.pw} · berlaku s.d. {new Date(verified.expiredAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>

          <Field label="Nama Administrator" value={namaAdmin} onChange={setNamaAdmin} required />
          <Field label="Jabatan Administrator" value={jabatan} onChange={setJabatan} required placeholder="Contoh: Sekretaris" />
          <Field
            label="NIK"
            value={nik}
            onChange={(v) => setNik(v.replace(/\D/g, "").slice(0, 16))}
            required
            placeholder="3404010101900001"
            helper="NIK harus 16 digit."
          />
          <Field
            label="Nomor HP WhatsApp"
            value={hp}
            onChange={setHp}
            required
            placeholder="08xxxxxxxxxx"
            helper="Nomor WhatsApp akan otomatis disesuaikan ke format +62."
          />
          <Field label="Email" value={email} onChange={setEmail} required placeholder="admin@pcnu.id" type="email" />
          <div>
            <Label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Upload Scan Surat Tugas
            </Label>
            <div className="mt-1.5 flex items-center gap-2 rounded-md border border-dashed border-border bg-secondary/30 p-3">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="border-0 bg-transparent p-0 file:mr-3"
              />
            </div>
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              Format PDF/JPG/PNG, maksimal 5MB.
            </p>
            {file && <p className="mt-1 text-[12px] text-foreground">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}
          </div>
          <div className="flex justify-between gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>Kembali</Button>
            <Button type="submit">Lanjut <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </div>
        </form>
      )}

      {step === 3 && verified && (
        <div className="mt-6">
          <p className="text-[13px] text-muted-foreground">Periksa kembali data sebelum mengirim.</p>
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            <Info label={`Nama ${verified.tingkat}`} value={verified.orgName} />
            <Info label="Wilayah" value={verified.pw} />
            <Info label="Administrator" value={namaAdmin} />
            <Info label="Jabatan" value={jabatan} />
            <Info label="NIK" value={maskNik(nik)} />
            <Info label="Nomor HP" value={hp} />
            <Info label="Email" value={email} />
            <Info label="Surat Tugas" value={file?.name ?? "—"} />
          </dl>
          <div className="mt-5 flex justify-between gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>Kembali Edit</Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim Pendaftaran
            </Button>
          </div>
        </div>
      )}

      {step === 4 && ticketId && (
        <div className="mt-6 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <h3 className="mt-4 text-[17px] font-semibold text-foreground">Pendaftaran berhasil dikirim.</h3>
          <div className="mt-5 rounded-md border border-border bg-secondary/40 px-6 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Nomor Tiket</p>
            <p className="mt-1 font-mono text-[22px] font-bold text-primary-dark">{ticketId}</p>
          </div>
          <p className="mt-4 text-[13px] text-muted-foreground">
            Simpan nomor tiket ini untuk mengecek status pendaftaran.
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Proses review maksimal 3 hari kerja.
          </p>
          <Button
            className="mt-5"
            onClick={() => navigate({ to: "/status/$ticketId", params: { ticketId } })}
          >
            Cek Status
          </Button>
        </div>
      )}
    </div>
  );
}

export function CekStatusForm() {
  const [tiket, setTiket] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = tiket.trim().toUpperCase();
    if (!t) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const { getState } = await import("@/lib/store");
    const found = getState().registrations.find((r) => r.ticketId.toUpperCase() === t);
    setLoading(false);
    if (!found) return toast.error("Nomor tiket tidak ditemukan.");
    navigate({ to: "/status/$ticketId", params: { ticketId: found.ticketId } });
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <Label htmlFor="tiket" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Nomor Tiket
        </Label>
        <Input
          id="tiket"
          value={tiket}
          onChange={(e) => setTiket(e.target.value)}
          placeholder="AKT-2026-000123"
          className="mt-1.5 h-11 font-mono"
          autoFocus
        />
        <p className="mt-1.5 text-[12px] text-muted-foreground">
          Masukkan nomor tiket yang diterima saat pendaftaran.
        </p>
      </div>
      <Button type="submit" className="h-11 w-full" disabled={loading}>
        {loading ? "Memeriksa…" : "Cek Status"}
      </Button>
      <details className="rounded-md border border-border bg-secondary/40 p-3 text-[12px] text-muted-foreground">
        <summary className="cursor-pointer font-medium text-foreground">Tiket demo</summary>
        <ul className="mt-1.5 space-y-0.5 font-mono">
          <li>AKT-2026-000121 — Pending</li>
          <li>AKT-2026-000101 — Disetujui</li>
          <li>AKT-2026-000123 — Ditolak</li>
        </ul>
      </details>
    </form>
  );
}

function Stepper({ step }: { step: number }) {
  const labels = ["Kode Akses", "Data Admin", "Konfirmasi", "Selesai"];
  return (
    <ol className="flex items-center gap-2">
      {labels.map((l, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <li key={l} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                done
                  ? "bg-primary text-primary-foreground"
                  : active
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
            </div>
            <span className={`hidden text-[11px] sm:inline ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
              {l}
            </span>
            {n < labels.length && <div className="h-px flex-1 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

function Field({
  label, value, onChange, required, placeholder, type = "text", helper,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  helper?: string;
}) {
  return (
    <div>
      <Label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}{required && " *"}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-11"
        required={required}
      />
      {helper && <p className="mt-1.5 text-[12px] text-muted-foreground">{helper}</p>}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[13px] font-medium text-foreground">{value}</p>
    </div>
  );
}
