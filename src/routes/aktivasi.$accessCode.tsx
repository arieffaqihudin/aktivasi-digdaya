import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { useStore, actions } from "@/lib/store";
import { isValidNIK, isValidEmail, normalizePhone, isValidPhone } from "@/utils/validation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Upload, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/aktivasi/$accessCode")({
  head: () => ({
    meta: [
      { title: "Aktivasi Administrator — Portal Aktivasi Digdaya" },
      { name: "description", content: "Lengkapi data administrator untuk aktivasi kepengurusan." },
    ],
  }),
  component: AktivasiPage,
});

function AktivasiPage() {
  const { accessCode } = Route.useParams();
  const navigate = useNavigate();
  const code = useStore((s) => s.accessCodes.find((c) => c.code.toUpperCase() === accessCode.toUpperCase()));

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [namaAdmin, setNamaAdmin] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [nik, setNik] = useState("");
  const [hp, setHp] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const codeInvalid = useMemo(() => {
    if (!code) return "Kode akses tidak ditemukan.";
    if (code.status === "Expired") return "Kode akses sudah kedaluwarsa.";
    if (code.status === "Used") return "Kode akses ini sudah digunakan.";
    if (code.status === "Disabled") return "Kode akses ini telah dinonaktifkan.";
    return null;
  }, [code]);

  if (!code || codeInvalid) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 px-4 py-14">
          <div className="mx-auto w-full max-w-[520px] rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
            <p className="mt-3 text-[14px] font-semibold text-foreground">{codeInvalid}</p>
            <Link to="/kode-akses" className="mt-4 inline-block text-[13px] text-primary hover:underline">
              Coba kode akses lain
            </Link>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaAdmin.trim() || !jabatan.trim()) return toast.error("Lengkapi data administrator.");
    if (!isValidNIK(nik)) return toast.error("NIK harus 16 digit angka.");
    if (!isValidEmail(email)) return toast.error("Format email tidak valid.");
    const normHp = normalizePhone(hp);
    if (!isValidPhone(normHp)) return toast.error("Nomor HP tidak valid.");
    if (!file) return toast.error("Upload Surat Tugas wajib.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Ukuran file maksimal 5MB.");
    setHp(normHp);
    setStep(2);
  };

  const submit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    const reg = actions.submitPublicActivation({
      accessCode: code.code,
      namaAdmin, jabatan, nik, hp, email,
      suratTugasFile: file?.name,
    });
    setSubmitting(false);
    if (!reg) return toast.error("Gagal mengirim pendaftaran.");
    setTicketId(reg.ticketId);
    setStep(3);
  };

  const maskNik = (n: string) => (n.length === 16 ? n.slice(0, 4) + "********" + n.slice(-4) : n);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 px-4 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-[620px]">
          <Link to="/kode-akses" className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Ganti kode akses
          </Link>
          <div className="mt-4 text-center">
            <h1 className="text-[22px] font-bold tracking-tight text-foreground sm:text-[24px]">
              Aktivasi Administrator Digdaya
            </h1>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Lengkapi data administrator untuk pengajuan aktivasi.
            </p>
          </div>

          <div className="mt-7 rounded-xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-7">
            <div className="rounded-md border border-primary/30 bg-accent p-3.5">
              <div className="flex items-center gap-2 text-[12px] font-medium text-primary-dark">
                <CheckCircle2 className="h-4 w-4" /> Kode akses valid
              </div>
              <p className="mt-2 text-[15px] font-semibold text-foreground">{code.orgName}</p>
              <p className="text-[12px] text-muted-foreground">
                Tingkat {code.tingkat} · {code.pw}
              </p>
            </div>

            {step === 1 && (
              <form onSubmit={handleStep1} className="mt-5 space-y-4">
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
                  helper="Akan otomatis disesuaikan ke format +62."
                />
                <Field label="Email" value={email} onChange={setEmail} required placeholder="admin@pcnu.id" type="email" />
                <div>
                  <Label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Upload Surat Tugas
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
                  <p className="mt-1.5 text-[12px] text-muted-foreground">Format PDF/JPG/PNG, maksimal 5MB.</p>
                  {file && <p className="mt-1 text-[12px] text-foreground">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}
                </div>
                <Button type="submit" className="h-11 w-full">
                  Lanjut <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </form>
            )}

            {step === 2 && (
              <div className="mt-5">
                <p className="text-[13px] text-muted-foreground">Periksa kembali data sebelum mengirim.</p>
                <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Info label="Administrator" value={namaAdmin} />
                  <Info label="Jabatan" value={jabatan} />
                  <Info label="NIK" value={maskNik(nik)} />
                  <Info label="Nomor HP" value={hp} />
                  <Info label="Email" value={email} />
                  <Info label="Surat Tugas" value={file?.name ?? "—"} />
                </dl>
                <div className="mt-5 flex justify-between gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>Kembali Edit</Button>
                  <Button onClick={submit} disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Kirim Pengajuan
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && ticketId && (
              <div className="mt-5 text-center">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 text-[17px] font-semibold text-foreground">
                  Pengajuan aktivasi berhasil dikirim.
                </h3>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  Simpan nomor tiket berikut untuk mengecek status pengajuan Anda.
                </p>
                <div className="mt-4 rounded-md border border-border bg-secondary/40 px-6 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Nomor Tiket</p>
                  <p className="mt-1 font-mono text-[22px] font-bold text-primary-dark">{ticketId}</p>
                </div>
                <div className="mt-5 flex justify-center gap-2">
                  <Button onClick={() => navigate({ to: "/status/$ticketId", params: { ticketId } })}>
                    Cek Status
                  </Button>
                  <Button variant="outline" onClick={() => navigate({ to: "/" })}>
                    Kembali ke Portal
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
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
