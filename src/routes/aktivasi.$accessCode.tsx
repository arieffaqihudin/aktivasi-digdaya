import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useStore, actions } from "@/lib/store";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import {
  AdministratorForm,
  emptyAdminValue,
  validateAdmin,
  adminToSubmit,
  type AdminFormValue,
} from "@/components/forms/AdministratorForm";
import {
  SuratTugasSelector,
  emptySuratTugas,
  validateSuratTugas,
  type SuratTugasValue,
} from "@/components/forms/SuratTugasSelector";

export const Route = createFileRoute("/aktivasi/$accessCode")({
  validateSearch: (search: Record<string, unknown>) => ({
    org: typeof search.org === "string" ? search.org : undefined,
  }),
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
  const { org: selectedOrgId } = Route.useSearch();
  const navigate = useNavigate();
  const code = useStore((s) => s.accessCodes.find((c) => c.code.toUpperCase() === accessCode.toUpperCase()));

  const [step, setStep] = useState<1 | 2>(1);
  const [admin, setAdmin] = useState<AdminFormValue>(emptyAdminValue());
  const [surat, setSurat] = useState<SuratTugasValue>(emptySuratTugas("uploadOnly"));
  const [submitting, setSubmitting] = useState(false);

  const isScoped = code?.kind === "Scoped";
  const resolvedOrg = useMemo(() => {
    if (!code) return null;
    if (!isScoped) {
      return { id: code.orgId, nama: code.orgName, pw: code.pw, tingkat: code.tingkat };
    }
    if (!selectedOrgId) return null;
    const eligible = actions.getEligibleOrgsForCode(code);
    const found = eligible.find((o) => o.id === selectedOrgId);
    if (!found) return null;
    return { id: found.id, nama: found.nama, pw: found.pwName, tingkat: found.tingkat };
  }, [code, isScoped, selectedOrgId]);

  const codeInvalid = useMemo(() => {
    if (!code) return "Kode akses tidak ditemukan.";
    if (code.status === "Expired") return "Kode akses sudah kedaluwarsa.";
    if (code.status === "Used") return "Kode akses ini sudah digunakan.";
    if (code.status === "Disabled") return "Kode akses ini telah dinonaktifkan.";
    if (isScoped && !selectedOrgId)
      return "Silakan pilih kepengurusan terlebih dahulu melalui halaman kode akses.";
    if (isScoped && !resolvedOrg)
      return "Kepengurusan yang dipilih sudah tidak tersedia atau sudah ada pengajuan aktif.";
    return null;
  }, [code, isScoped, selectedOrgId, resolvedOrg]);

  if (!code || codeInvalid) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 px-4 py-14">
          <div className="mx-auto w-full max-w-[520px] rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
            <p className="mt-3 text-[14px] font-semibold text-foreground">{codeInvalid}</p>
            <Button asChild className="mt-4">
              <Link to="/kode-akses">Kembali ke Kode Akses</Link>
            </Button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const orgStatusLabel = resolvedOrg
    ? actions.getEffectiveStatusOrg?.(resolvedOrg.id) ?? "Belum Production"
    : "Belum Production";

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const adminErr = validateAdmin(admin);
    if (adminErr) return toast.error(adminErr);
    const suratErr = validateSuratTugas(surat);
    if (suratErr) return toast.error(suratErr);
    setStep(2);
  };

  const submit = async () => {
    if (!resolvedOrg) return toast.error("Kepengurusan belum dipilih.");
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 250));
    const payload = adminToSubmit(admin);
    const reg = actions.submitPublicActivation({
      accessCode: code.code,
      selectedOrgId: isScoped ? resolvedOrg.id : undefined,
      ...payload,
      suratTugasFile: surat.file?.name,
    });
    setSubmitting(false);
    if (!reg) return toast.error("Gagal mengirim pendaftaran.");
    navigate({ to: "/aktivasi/sukses/$ticketId", params: { ticketId: reg.ticketId } });
  };

  const maskNik = (n: string) => (n.length === 16 ? n.slice(0, 4) + "********" + n.slice(-4) : n);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 px-4 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-[640px]">
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

          {/* Data Organisasi (read-only) */}
          <div className="mt-7 rounded-xl border border-primary/30 bg-accent p-4 sm:p-5">
            <div className="flex items-center gap-2 text-[12px] font-medium text-primary-dark">
              <CheckCircle2 className="h-4 w-4" /> Kode akses valid
            </div>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              <Info label="Kode Akses" value={code.code} mono />
              <Info label="Nama Organisasi" value={resolvedOrg?.nama ?? code.orgName} />
              <Info label="Tingkat" value={resolvedOrg?.tingkat ?? code.tingkat} />
              <Info label="Wilayah" value={resolvedOrg?.pw ?? code.pw} />
              <Info label="Status" value={orgStatusLabel} />
            </dl>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Karena kepengurusan belum aktif di Digdaya, surat tugas wajib diunggah secara manual.
            </p>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-7">
            {step === 1 && (
              <form onSubmit={handleNext} className="space-y-6">
                <AdministratorForm value={admin} onChange={setAdmin} />

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Surat Tugas</p>
                  <SuratTugasSelector value={surat} onChange={setSurat} mode="uploadOnly" />
                </div>

                <Button type="submit" className="h-11 w-full">
                  Lanjut Konfirmasi <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </form>
            )}

            {step === 2 && (
              <div>
                <p className="text-[13px] text-muted-foreground">Periksa kembali data sebelum mengirim.</p>
                <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Info label="Nama Administrator" value={admin.namaAdmin} />
                  <Info label="Jenis" value={admin.administratorType || "—"} />
                  <Info label="Jabatan" value={admin.jabatan} />
                  <Info label="NIK" value={maskNik(admin.nik)} />
                  <Info label="WhatsApp" value={`+62${admin.waLocal}`} />
                  <Info label="Email" value={admin.email} />
                  <Info label="Surat Tugas" value={surat.file?.name ?? "—"} />
                </dl>
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Kembali Edit
                  </Button>
                  <Button onClick={submit} disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Kirim Pengajuan
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

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-background/60 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-[13px] font-medium text-foreground ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
