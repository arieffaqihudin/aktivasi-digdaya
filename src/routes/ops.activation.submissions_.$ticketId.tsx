import { createFileRoute, Link } from "@tanstack/react-router";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { useStore, actions } from "@/lib/store";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { RevisionRequestDialog } from "@/components/review/RevisionRequestDialog";
import { REJECTION_CATEGORY_LABEL } from "@/data/mockData";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, FileText, Clock, RefreshCw } from "lucide-react";
import { formatDateTime } from "@/utils/status";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

export const Route = createFileRoute("/ops/activation/submissions_/$ticketId")({
  component: SubmissionDetail,
});

function SubmissionDetail() {
  const { ticketId } = Route.useParams();
  const reg = useStore((s) =>
    s.registrations.find((r) => {
      const candidate = r.ticketId || (r as typeof r & { nomorTiket?: string; id?: string }).nomorTiket || (r as typeof r & { id?: string }).id;
      return candidate === ticketId;
    })
  );
  const audit = useStore((s) => s.audit.filter((a) => a.ticketId === ticketId));
  const [approveOpen, setApproveOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!ticketId) {
    return (
      <div>
        <OpsPageHeader title="Detail Pengajuan Aktivasi" breadcrumb={[{ label: "Aktivasi Digdaya", to: "/ops/activation" }, { label: "Pengajuan Aktivasi", to: "/ops/activation/submissions" }, { label: "Tidak Valid" }]} />
        <OpsPageBody>
          <OpsCard>
            <p className="text-sm text-muted-foreground">Nomor tiket tidak ditemukan.</p>
          </OpsCard>
        </OpsPageBody>
      </div>
    );
  }

  if (!reg) {
    return (
      <div>
        <OpsPageHeader title="Tiket Tidak Ditemukan" breadcrumb={[{ label: "Aktivasi Digdaya", to: "/ops/activation" }, { label: "Pengajuan Aktivasi", to: "/ops/activation/submissions" }, { label: ticketId }]} />
        <OpsPageBody>
          <OpsCard>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Tiket {ticketId} tidak ditemukan.</p>
              <Link to="/ops/activation/submissions" className="inline-flex">
                <Button variant="outline"><ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali</Button>
              </Link>
            </div>
          </OpsCard>
        </OpsPageBody>
      </div>
    );
  }

  const doApprove = async () => {
    setBusy(true);
    actions.approve(reg.ticketId);
    setBusy(false);
    setApproveOpen(false);
    toast.success(`${reg.ticketId} disetujui dan masuk batch Peruri.`);
  };

  return (
    <div>
      <OpsPageHeader
        title={`Detail ${reg.ticketId}`}
        subtitle={`${reg.tipeOrg} · ${reg.namaOrg}`}
        breadcrumb={[{ label: "Aktivasi Digdaya", to: "/ops/activation" }, { label: "Pengajuan Aktivasi", to: "/ops/activation/submissions" }, { label: "Detail" }]}
        action={<Link to="/ops/activation/submissions" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Kembali</Link>}
      />
      <OpsPageBody>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <OpsCard title="Informasi Pengajuan" action={<StatusBadge status={reg.status} />}>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Info label="Nomor Tiket" value={reg.ticketId} mono />
                <Info label="Sumber Pengajuan" value={reg.sumberPengajuan === "PUBLIC" ? "Kode Akses" : "Login Digdaya"} />
                <Info label="Organisasi" value={`${reg.tipeOrg} · ${reg.namaOrg}`} />
                <Info label="Wilayah" value={reg.pw} />
                <Info label="Kode Akses" value={reg.accessCode ?? "—"} mono />
                <Info label="Submit" value={formatDateTime(reg.submittedAt)} />
              </dl>
            </OpsCard>

            <OpsCard
              title="Data Administrator"
              action={
                normalizeWhatsAppNumber(reg.hp)
                  ? <WhatsAppButton phone={reg.hp} ticketId={reg.ticketId} label="Hubungi via WhatsApp" variant="solid" />
                  : <span className="text-[11.5px] text-muted-foreground">Nomor WhatsApp belum tersedia.</span>
              }
            >
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Info label="Nama" value={reg.namaAdmin} />
                <Info label="Jabatan" value={reg.jabatan} />
                <Info label="NIK" value={reg.nik} mono />
                <Info label="Nomor HP" value={reg.hp} />
                <Info label="Email" value={reg.email} />
              </dl>
            </OpsCard>

            <OpsCard title="Surat Tugas" action={<span className={"inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium " + (reg.sumberSuratTugas === "DIGDAYA_PERSURATAN" ? "bg-[oklch(0.94_0.06_150)] text-[oklch(0.36_0.10_152)]" : "bg-secondary text-muted-foreground")}>{reg.sumberSuratTugas === "DIGDAYA_PERSURATAN" ? "Dari Sistem" : "Upload Manual"}</span>}>
              {reg.sumberSuratTugas === "DIGDAYA_PERSURATAN" && reg.dokumenSistem ? (
                <div className="rounded-md border border-primary/30 bg-accent/40 p-4 space-y-1.5">
                  <p className="text-[15px] font-semibold">{reg.dokumenSistem.namaDokumen}</p>
                  <p className="text-[12px] text-muted-foreground">Nomor: <span className="font-mono">{reg.dokumenSistem.nomorSurat}</span></p>
                  <p className="text-[12px] text-muted-foreground">Penandatangan: {reg.dokumenSistem.penandatangan}</p>
                  <Button type="button" variant="outline" size="sm" className="mt-2 h-8 text-[12px]">Lihat Dokumen</Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-md border border-dashed border-border bg-secondary/30 p-6">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{reg.suratTugasFile ?? "surat-tugas.pdf"}</p>
                    <Button variant="outline" size="sm" className="mt-1.5 h-8 text-[12px]">Lihat Dokumen</Button>
                  </div>
                </div>
              )}
            </OpsCard>

            {(reg.status === "PerluPerbaikan" || reg.status === "RejectedFinal") && reg.rejectReason && (
              <OpsCard className="border-destructive/30 bg-destructive/5">
                <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
                  {reg.status === "RejectedFinal" ? "Ditolak Final" : "Perlu Perbaikan"}
                  {reg.rejectionCategory && <span className="ml-2 font-normal normal-case">· {REJECTION_CATEGORY_LABEL[reg.rejectionCategory]}</span>}
                </p>
                <p className="mt-1 text-sm">{reg.rejectReason}</p>
              </OpsCard>
            )}
          </div>

          <div className="space-y-5">
            <OpsCard title="Tindakan">
              <div className="flex flex-col gap-2">
                {reg.status === "Pending" && (
                  <>
                    <Button onClick={() => setApproveOpen(true)} className="w-full bg-success text-success-foreground hover:bg-success/90"><CheckCircle2 className="mr-1.5 h-4 w-4" /> Setujui</Button>
                    <Button variant="outline" className="w-full border-warning/40 text-warning-foreground hover:bg-warning/10" onClick={() => setRevisionOpen(true)}><RefreshCw className="mr-1.5 h-4 w-4" /> Minta Perbaikan / Tolak</Button>
                  </>
                )}
                <Link to="/ops/activation/submissions" className="w-full"><Button variant="outline" className="w-full"><ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali</Button></Link>
              </div>
            </OpsCard>

            <OpsCard title="Audit Trail">
              <ul className="space-y-3 text-xs">
                {audit.length === 0 && <li className="text-muted-foreground">Belum ada catatan.</li>}
                {audit.map((a) => (
                  <li key={a.id} className="border-l-2 border-border pl-3">
                    <div className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" />{formatDateTime(a.timestamp)}</div>
                    <p className="mt-0.5 font-mono text-[10px] font-semibold text-primary-dark">{a.action}</p>
                    <p className="text-foreground">{a.detail}</p>
                  </li>
                ))}
              </ul>
            </OpsCard>
          </div>
        </div>
      </OpsPageBody>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui pengajuan ini?</DialogTitle>
            <DialogDescription>Organisasi menjadi Production dan masuk batch Peruri.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>Batal</Button>
            <Button onClick={doApprove} disabled={busy}>Ya, Setujui</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RevisionRequestDialog open={revisionOpen} onOpenChange={setRevisionOpen} ticketId={reg.ticketId} />
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={"mt-0.5 text-sm font-medium text-foreground " + (mono ? "font-mono" : "")}>{value}</p>
    </div>
  );
}
