import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { actions, type VerifyResult } from "@/lib/store";
import { isValidNIK, isValidEmail, normalizePhone, isValidPhone } from "@/utils/validation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Loader2, Upload, AlertCircle } from "lucide-react";
import type { AccessCode } from "@/data/mockData";

export const Route = createFileRoute("/aktivasi")({
  head: () => ({
    meta: [
      { title: "Mulai Aktivasi PC — Portal Aktivasi Digdaya" },
      { name: "description", content: "Aktivasi administrator PC melalui kode akses resmi PBNU." },
    ],
  }),
  component: Aktivasi,
});

function Aktivasi() {
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
    setVerifying(true); setCodeError(null);
    await new Promise((r) => setTimeout(r, 500));
    const res: VerifyResult = actions.verifyAccessCode(code);
    setVerifying(false);
    if (!res.ok) {
      const msg = {
        notfound: "Kode akses tidak ditemukan atau tidak valid. Silakan hubungi Tim Digdaya PBNU.",
        expired: "Kode akses sudah kedaluwarsa. Silakan minta kode akses baru.",
        used: "Kode akses ini sudah digunakan. Silakan cek status pendaftaran atau hubungi Tim Digdaya.",
        disabled: "Kode akses ini telah dinonaktifkan.",
      }[res.reason];
      setCodeError(msg); return;
    }
    setVerified(res.code); setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNIK(nik)) { toast.error("NIK harus 16 digit angka."); return; }
    if (!isValidEmail(email)) { toast.error("Format email tidak valid."); return; }
    const normHp = normalizePhone(hp);
    if (!isValidPhone(normHp)) { toast.error("Nomor HP tidak valid."); return; }
    if (!file) { toast.error("Upload Scan Surat Tugas wajib."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Ukuran file maksimal 5MB."); return; }
    setHp(normHp); setStep(3);
  };

  const submit = async () => {
    if (!verified) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    const reg = actions.submitJalurA({
      accessCode: verified.code,
      namaAdmin, jabatan, nik, hp, email,
      suratTugasFile: file?.name,
    });
    setSubmitting(false);
    if (!reg) { toast.error("Gagal mengirim pendaftaran."); return; }
    setTicketId(reg.ticketId); setStep(4);
    toast.success("Pendaftaran berhasil dikirim.");
  };

  const maskNik = (n: string) => n.length === 16 ? n.slice(0,4)+"********"+n.slice(-4) : n;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Beranda
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Aktivasi Administrator PC</h1>
          <p className="mt-1 text-sm text-muted-foreground">Jalur A · menggunakan kode akses dari PBNU.</p>

          <Stepper step={step} />

          {step === 1 && (
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold">Step 1 · Verifikasi Kode Akses</h2>
              <p className="mt-1 text-sm text-muted-foreground">Masukkan kode akses one-time dari PBNU.</p>
              <div className="mt-4">
                <Label htmlFor="code" className="text-xs uppercase tracking-wider text-muted-foreground">Kode Akses</Label>
                <Input id="code" value={code} onChange={(e) => { setCode(e.target.value); setCodeError(null); }}
                  placeholder="DGD-XXXX-XXXX" className="mt-1.5 font-mono uppercase" autoFocus />
                {codeError && (
                  <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{codeError}</span>
                  </div>
                )}
              </div>
              <Button onClick={verify} disabled={verifying || !code.trim()} className="mt-5 w-full sm:w-auto">
                {verifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                Verifikasi Kode Akses
              </Button>
              <div className="mt-5 rounded-md border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Kode demo:</p>
                <p className="mt-1 font-mono">DGD-MN8P-3KLR · DGD-2C7J-BVQK · DGD-T5Z9-MWPE</p>
              </div>
            </div>
          )}

          {step === 2 && verified && (
            <form onSubmit={handleStep2} className="mt-6 rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-base font-semibold">Step 2 · Data Administrator PC</h2>
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Kode Terverifikasi</p>
                <p className="font-semibold text-foreground">{verified.pcName}</p>
                <p className="text-xs text-muted-foreground">{verified.pw} · kode {verified.code}</p>
              </div>
              <Field label="Nama Administrator" value={namaAdmin} onChange={setNamaAdmin} required />
              <Field label="Jabatan Administrator" value={jabatan} onChange={setJabatan} required placeholder="Contoh: Sekretaris" />
              <Field label="NIK (16 digit)" value={nik} onChange={(v) => setNik(v.replace(/\D/g, "").slice(0, 16))} required placeholder="3404010101900001" />
              <Field label="Nomor HP WhatsApp" value={hp} onChange={setHp} required placeholder="08xxxxxxxxxx" />
              <Field label="Email" value={email} onChange={setEmail} required placeholder="admin@pcnu.id" type="email" />
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Scan Surat Tugas (PDF/JPG/PNG, max 5MB)</Label>
                <div className="mt-1.5 flex items-center gap-2 rounded-md border border-dashed border-border bg-secondary/30 p-3">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="border-0 bg-transparent p-0 file:mr-3" />
                </div>
                {file && <p className="mt-1 text-xs text-muted-foreground">{file.name} · {(file.size/1024).toFixed(0)} KB</p>}
              </div>
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>Kembali</Button>
                <Button type="submit">Lanjut ke Konfirmasi <ArrowRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </form>
          )}

          {step === 3 && verified && (
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold">Step 3 · Konfirmasi Pendaftaran</h2>
              <p className="mt-1 text-sm text-muted-foreground">Periksa kembali data sebelum mengirim.</p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <Info label="Kode Akses" value={verified.code} />
                <Info label="Nama PC" value={verified.pcName} />
                <Info label="Wilayah PW" value={verified.pw} />
                <Info label="Administrator" value={namaAdmin} />
                <Info label="Jabatan" value={jabatan} />
                <Info label="NIK" value={maskNik(nik)} />
                <Info label="Nomor HP" value={hp} />
                <Info label="Email" value={email} />
                <Info label="Surat Tugas" value={file?.name ?? "—"} />
              </dl>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>Kembali Edit</Button>
                <Button onClick={submit} disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kirim Pendaftaran
                </Button>
              </div>
            </div>
          )}

          {step === 4 && ticketId && (
            <div className="mt-6 rounded-xl border border-success/30 bg-success/5 p-6 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              <h2 className="mt-3 text-lg font-bold text-foreground">Pendaftaran Berhasil Dikirim</h2>
              <p className="mt-1 text-sm text-muted-foreground">Sedang menunggu review Tim Digdaya PBNU.</p>
              <div className="mx-auto mt-4 inline-flex flex-col items-center rounded-md border border-border bg-card px-5 py-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Nomor Tiket</p>
                <p className="mt-1 font-mono text-xl font-bold text-primary-dark">{ticketId}</p>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Estimasi proses: maksimal 3 hari kerja.</p>
              <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                <Button onClick={() => navigate({ to: "/status/$ticketId", params: { ticketId } })}>Cek Status Pendaftaran</Button>
                <Link to="/"><Button variant="outline">Kembali ke Beranda</Button></Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const labels = ["Verifikasi Kode", "Data Admin", "Konfirmasi", "Selesai"];
  return (
    <ol className="mt-6 flex items-center gap-2">
      {labels.map((l, i) => {
        const n = i + 1;
        const active = n === step, done = n < step;
        return (
          <li key={l} className="flex flex-1 items-center gap-2">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              done ? "bg-success text-success-foreground" : active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>{done ? <CheckCircle2 className="h-4 w-4" /> : n}</div>
            <span className={`hidden text-xs sm:inline ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{l}</span>
            {n < labels.length && <div className="h-px flex-1 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

function Field({ label, value, onChange, required, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}{required && " *"}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1.5" required={required} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
