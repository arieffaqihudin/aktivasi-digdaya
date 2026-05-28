import { Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useStore, actions } from "@/lib/store";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { REJECTION_CATEGORY_LABEL, type SumberSuratTugas } from "@/data/mockData";
import { SuratTugasSelector, validateSuratTugas, type SuratTugasValue } from "@/components/forms/SuratTugasSelector";
import { AdministratorForm, adminFromExisting, adminToSubmit, validateAdmin } from "@/components/forms/AdministratorForm";

export function InternalRevisionForm({ ticketId, scope }: { ticketId: string; scope: "pw" | "pc" }) {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const reg = useStore((s) => s.registrations.find((r) => r.ticketId === ticketId));

  const initialSumber: SumberSuratTugas = (reg?.sumberSuratTugas as SumberSuratTugas) ?? "DIGDAYA_PERSURATAN";
  const [admin, setAdmin] = useState(() => adminFromExisting(reg ?? {}));
  const [surat, setSurat] = useState<SuratTugasValue>({
    sumber: initialSumber,
    dokumen: reg?.dokumenSistem ?? null,
    file: null,
  });
  const [busy, setBusy] = useState(false);

  const backTo = scope === "pw" ? "/pw/status-pengajuan" : "/pc/status-pengajuan";

  if (!reg) {
    return (
      <div className="p-6">
        <PageHeader title="Tiket tidak ditemukan" subtitle="Periksa nomor tiket Anda." />
        <Link to={backTo} className="ml-6 mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali
        </Link>
      </div>
    );
  }

  if (reg.status !== "PerluPerbaikan") {
    return (
      <div>
        <PageHeader title="Perbaiki Pengajuan" subtitle={`Tiket ${reg.ticketId}`} />
        <div className="mx-auto max-w-2xl space-y-3 p-6">
          <div className="rounded-md border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            Pengajuan ini tidak memerlukan perbaikan saat ini.
          </div>
          <Link to={backTo}><Button variant="outline">Kembali ke Status Pengajuan</Button></Link>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const aErr = validateAdmin(admin);
    if (aErr) return toast.error(aErr);
    const sErr = validateSuratTugas(surat);
    if (sErr) return toast.error(sErr);

    setBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    const payload = adminToSubmit(admin);
    const next = actions.resubmitRevision(ticketId, {
      namaAdmin: payload.namaAdmin, jabatan: payload.jabatan, nik: payload.nik, hp: payload.hp, email: payload.email,
      sumberSuratTugas: surat.sumber,
      suratTugasFile: surat.file?.name,
      dokumenSistem: surat.dokumen ?? undefined,
      submitterEmail: user?.email,
      submitterRole: user?.role,
    });
    setBusy(false);
    if (!next) return toast.error("Gagal mengirim revisi.");
    toast.success(`Revisi ke-${next.revisionCount} dikirim. Status kembali ke Pending Review.`);
    navigate({ to: backTo });
  };

  return (
    <div>
      <PageHeader
        title="Perbaiki Pengajuan"
        subtitle={`Tiket ${reg.ticketId} — ${reg.namaOrg}`}
        breadcrumb={[
          { label: scope.toUpperCase(), to: scope === "pw" ? "/pw" : "/pc" },
          { label: "Status Pengajuan", to: backTo },
          { label: "Perbaiki" },
        ]}
      />
      <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5 p-6">
        {reg.rejectReason && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-destructive">
              <AlertCircle className="h-4 w-4" /> Catatan Reviewer
              {reg.rejectionCategory && (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal">
                  {REJECTION_CATEGORY_LABEL[reg.rejectionCategory]}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[13px] text-foreground">{reg.rejectReason}</p>
            {(reg.revisionCount ?? 0) > 0 && (
              <p className="mt-1 text-[11px] text-muted-foreground">Revisi sebelumnya: {reg.revisionCount}</p>
            )}
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Data Organisasi</p>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <Info label="Organisasi" value={reg.namaOrg} />
            <Info label="Tipe" value={reg.tipeOrg} />
            <Info label="Wilayah" value={reg.pw} />
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <AdministratorForm value={admin} onChange={setAdmin} />
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-semibold">Surat Tugas</p>
          <SuratTugasSelector value={surat} onChange={setSurat} />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Link to={backTo}>
            <Button type="button" variant="outline" className="w-full sm:w-auto">Batal</Button>
          </Link>
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kirim Revisi
          </Button>
        </div>
      </form>
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
