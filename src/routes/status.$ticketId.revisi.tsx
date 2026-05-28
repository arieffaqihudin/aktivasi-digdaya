import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useStore, actions } from "@/lib/store";
import { isValidNIK, isValidEmail, normalizePhone, isValidPhone } from "@/utils/validation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Upload, AlertCircle } from "lucide-react";
import { REJECTION_CATEGORY_LABEL } from "@/data/mockData";

export const Route = createFileRoute("/status/$ticketId/revisi")({
  head: ({ params }) => ({
    meta: [
      { title: `Perbaiki ${params.ticketId} — Portal Aktivasi Digdaya` },
      { name: "description", content: "Perbaiki pengajuan aktivasi dan unggah ulang surat tugas." },
    ],
  }),
  component: RevisiPublicPage,
});

function RevisiPublicPage() {
  const { ticketId } = Route.useParams();
  const navigate = useNavigate();
  const reg = useStore((s) => s.registrations.find((r) => r.ticketId === ticketId));

  const [namaAdmin, setNamaAdmin] = useState(reg?.namaAdmin ?? "");
  const [jabatan, setJabatan] = useState(reg?.jabatan ?? "");
  const [nik, setNik] = useState(reg?.nik ?? "");
  const [hp, setHp] = useState(reg?.hp ?? "");
  const [email, setEmail] = useState(reg?.email ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  if (!reg) {
    return (
      <Wrapper>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-base font-semibold">Tiket tidak ditemukan</p>
          <Link to="/cek-status" className="mt-3 inline-block text-[13px] text-primary hover:underline">
            Kembali ke cek status
          </Link>
        </div>
      </Wrapper>
    );
  }

  if (reg.status !== "PerluPerbaikan") {
    return (
      <Wrapper>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-base font-semibold">Pengajuan tidak memerlukan perbaikan</p>
          <Link to="/status/$ticketId" params={{ ticketId }} className="mt-3 inline-block text-[13px] text-primary hover:underline">
            Lihat detail status
          </Link>
        </div>
      </Wrapper>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaAdmin.trim() || !jabatan.trim()) return toast.error("Lengkapi data administrator.");
    if (!isValidNIK(nik)) return toast.error("NIK harus 16 digit angka.");
    if (!isValidEmail(email)) return toast.error("Email tidak valid.");
    const normHp = normalizePhone(hp);
    if (!isValidPhone(normHp)) return toast.error("Nomor HP tidak valid.");
    if (!file && !reg.suratTugasFile) return toast.error("Upload ulang surat tugas wajib.");
    if (file && file.size > 5 * 1024 * 1024) return toast.error("Ukuran file maksimal 5MB.");

    setBusy(true);
    await new Promise((r) => setTimeout(r, 250));
    const next = actions.resubmitRevision(ticketId, {
      namaAdmin, jabatan, nik, hp: normHp, email,
      sumberSuratTugas: "MANUAL_UPLOAD",
      suratTugasFile: file?.name ?? reg.suratTugasFile,
      submitterEmail: email,
      submitterRole: "Pendaftar Publik",
    });
    setBusy(false);
    if (!next) return toast.error("Gagal mengirim revisi.");
    toast.success("Revisi berhasil dikirim. Status kembali ke Pending Review.");
    navigate({ to: "/status/$ticketId", params: { ticketId } });
  };

  return (
    <Wrapper>
      <Link to="/status/$ticketId" params={{ ticketId }} className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke detail
      </Link>
      <div className="mt-4 text-center">
        <h1 className="text-[22px] font-bold tracking-tight text-foreground sm:text-[24px]">
          Perbaiki Pengajuan
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Lengkapi perbaikan sesuai catatan reviewer di bawah.
        </p>
      </div>

      {reg.rejectReason && (
        <div className="mt-5 rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-destructive">
            <AlertCircle className="h-4 w-4" /> Catatan Reviewer
            {reg.rejectionCategory && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal">
                {REJECTION_CATEGORY_LABEL[reg.rejectionCategory]}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[13px] text-foreground">{reg.rejectReason}</p>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Data Organisasi</p>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <Info label="Organisasi" value={reg.namaOrg} />
            <Info label="Tipe" value={reg.tipeOrg} />
            <Info label="Wilayah" value={reg.pw} />
            {reg.accessCode && <Info label="Kode Akses" value={reg.accessCode} />}
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold">Data Administrator</p>
          <Field label="Nama Administrator" value={namaAdmin} onChange={setNamaAdmin} />
          <Field label="Jabatan" value={jabatan} onChange={setJabatan} />
          <Field label="NIK (16 digit)" value={nik} onChange={(v) => setNik(v.replace(/\D/g, "").slice(0, 16))} />
          <Field label="Nomor HP WhatsApp" value={hp} onChange={setHp} placeholder="08xxxxxxxxxx" />
          <Field label="Email" value={email} onChange={setEmail} type="email" />
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-semibold">Surat Tugas</p>
          <p className="text-[12px] text-muted-foreground">
            Karena organisasi belum aktif di Digdaya, surat tugas hanya dapat diunggah manual.
          </p>
          <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-secondary/30 p-3">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="border-0 bg-transparent p-0 file:mr-3" />
          </div>
          <p className="text-[12px] text-muted-foreground">Format PDF/JPG/PNG, maks 5MB.</p>
          {file ? (
            <p className="text-[12px] text-foreground">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>
          ) : reg.suratTugasFile ? (
            <p className="text-[12px] text-muted-foreground">File saat ini: {reg.suratTugasFile}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Link to="/status/$ticketId" params={{ ticketId }}>
            <Button type="button" variant="outline" className="w-full sm:w-auto">Batal</Button>
          </Link>
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kirim Revisi
          </Button>
        </div>
      </form>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 px-4 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-[640px]">{children}</div>
      </main>
      <PublicFooter />
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <Label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1.5" required />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[13px] font-medium text-foreground">{value}</p>
    </div>
  );
}
