import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore, actions } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { SLABadge } from "@/components/SLABadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Check, FileText, X, Loader2, CheckCircle2 } from "lucide-react";
import { formatDateTime, slaBucket } from "@/utils/status";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/review/$ticketId")({
  component: ReviewDetail,
});

function ReviewDetail() {
  const { ticketId } = Route.useParams();
  const navigate = useNavigate();
  const reg = useStore((s) => s.registrations.find((r) => r.ticketId === ticketId));
  const audit = useStore((s) => s.audit.filter((a) => a.ticketId === ticketId));
  const sla = useStore((s) => s.sla);

  const [openApprove, setOpenApprove] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!reg) {
    return (
      <div className="p-10 text-center">
        <p className="font-semibold">Tiket tidak ditemukan.</p>
        <Link to="/dashboard/review/antrian"><Button variant="outline" className="mt-3">Kembali ke Antrian</Button></Link>
      </div>
    );
  }

  const doApprove = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    actions.approve(reg.ticketId);
    setLoading(false); setOpenApprove(false);
    toast.success("Pendaftaran disetujui dan masuk batch Peruri.");
  };

  const doReject = async () => {
    if (!reason.trim()) { toast.error("Alasan penolakan wajib diisi."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    actions.reject(reg.ticketId, reason.trim());
    setLoading(false); setOpenReject(false); setReason("");
    toast.success("Pendaftaran ditolak dan catatan telah dikirim.");
  };

  return (
    <div>
      <PageHeader
        title={reg.ticketId}
        subtitle={reg.namaKepengurusan}
        action={<Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard/review/antrian" })}><ArrowLeft className="mr-1 h-4 w-4" /> Antrian</Button>}
      />
      <div className="grid gap-6 px-6 pb-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={reg.status} />
              <SLABadge bucket={slaBucket(reg, sla.greenMaxDays, sla.yellowMaxDays)} />
              {reg.includedInPeruriBatch && (
                <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary-dark">Masuk Batch Peruri</span>
              )}
            </div>
            <h2 className="mt-4 text-sm font-semibold">Data Kepengurusan</h2>
            <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Nama" value={reg.namaKepengurusan} />
              <Info label="Tingkat" value={reg.tingkat} />
              <Info label="Wilayah PW" value={reg.pw} />
              <Info label="Tanggal Submit" value={formatDateTime(reg.submittedAt)} />
            </dl>
            <h2 className="mt-5 text-sm font-semibold">Data Administrator</h2>
            <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Nama" value={reg.namaAdmin} />
              <Info label="Jabatan" value={reg.jabatan} />
              <Info label="NIK" value={reg.nik} />
              <Info label="Nomor HP" value={reg.hp} />
              <Info label="Email" value={reg.email} />
            </dl>
            <h2 className="mt-5 text-sm font-semibold">Dokumen</h2>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <DocPreview label="SK Penunjukan" file={reg.skFile} />
              <DocPreview label="Surat Tugas" file={reg.suratTugasFile} />
            </div>
          </div>

          {reg.status === "Approved" && (
            <div className="rounded-xl border border-success/30 bg-success/5 p-5">
              <h3 className="text-sm font-semibold text-success">Linimasa Auto-Provisioning</h3>
              <ol className="mt-3 space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Data administrator dicatat</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Akun menunggu aktivasi</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Masuk batch export Peruri</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Notifikasi dikirim</li>
              </ol>
            </div>
          )}

          {reg.status === "Rejected" && reg.rejectReason && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
              <h3 className="text-sm font-semibold text-destructive">Alasan Penolakan</h3>
              <p className="mt-1 text-sm">{reg.rejectReason}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {reg.status === "Pending" && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Aksi Review</h3>
              <p className="mt-1 text-xs text-muted-foreground">Tinjau data sebelum menyetujui atau menolak pendaftaran.</p>
              <div className="mt-4 space-y-2">
                <Button className="w-full" onClick={() => setOpenApprove(true)}><Check className="mr-1 h-4 w-4" /> Approve</Button>
                <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setOpenReject(true)}><X className="mr-1 h-4 w-4" /> Reject</Button>
              </div>
            </div>
          )}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Riwayat & Audit Trail</h3>
            <ol className="mt-3 space-y-3 text-xs">
              <li><p className="font-medium text-foreground">Pendaftaran diterima</p><p className="text-muted-foreground">{formatDateTime(reg.submittedAt)}</p></li>
              {reg.reviewedAt && <li><p className="font-medium text-foreground">{reg.status === "Approved" ? "Disetujui" : "Ditolak"} oleh {reg.reviewedBy}</p><p className="text-muted-foreground">{formatDateTime(reg.reviewedAt)}</p></li>}
              {audit.map((a) => (
                <li key={a.id}><p className="font-medium text-foreground">{a.action.replace(/_/g, " ")}</p><p className="text-muted-foreground">{formatDateTime(a.timestamp)} — {a.actor}</p></li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <Dialog open={openApprove} onOpenChange={setOpenApprove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui pendaftaran ini?</DialogTitle>
            <DialogDescription>Setelah disetujui, data akan masuk batch export Peruri berikutnya.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenApprove(false)}>Batal</Button>
            <Button onClick={doApprove} disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Setujui</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openReject} onOpenChange={setOpenReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak pendaftaran ini?</DialogTitle>
            <DialogDescription>Tuliskan alasan penolakan agar pengurus dapat memperbaiki data.</DialogDescription>
          </DialogHeader>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder="Contoh: NIK tidak sesuai dengan dokumen SK Penunjukan." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenReject(false)}>Batal</Button>
            <Button variant="destructive" onClick={doReject} disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Tolak Pendaftaran</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-0.5 font-medium">{value}</p></div>;
}
function DocPreview({ label, file }: { label: string; file?: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2 text-sm">
        <FileText className="h-4 w-4 text-primary" />
        <span className="truncate font-medium">{file || "Tidak diunggah"}</span>
      </div>
    </div>
  );
}
