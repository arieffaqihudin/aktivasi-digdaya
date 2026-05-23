import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useStore, actions } from "@/lib/store";
import { StatusBadge } from "@/components/StatusBadge";
import { JalurBadge } from "@/components/JalurBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, FileText, XCircle, Clock } from "lucide-react";
import { formatDateTime } from "@/utils/status";

export const Route = createFileRoute("/review/inbox/$ticketId")({
  component: ReviewDetail,
});

function ReviewDetail() {
  const { ticketId } = Route.useParams();
  const reg = useStore((s) => s.registrations.find((r) => r.ticketId === ticketId));
  const audit = useStore((s) => s.audit.filter((a) => a.ticketId === ticketId));
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (!reg) return <div className="p-10 text-sm text-muted-foreground">Tiket tidak ditemukan.</div>;

  const doApprove = async () => {
    setBusy(true); await new Promise((r) => setTimeout(r, 400));
    actions.approve(reg.ticketId); setBusy(false); setApproveOpen(false);
    toast.success(`${reg.ticketId} disetujui dan masuk batch Peruri.`);
  };
  const doReject = async () => {
    if (!reason.trim()) { toast.error("Alasan penolakan wajib diisi."); return; }
    setBusy(true); await new Promise((r) => setTimeout(r, 400));
    actions.reject(reg.ticketId, reason.trim()); setBusy(false); setRejectOpen(false);
    toast.success(`${reg.ticketId} ditolak.`);
    navigate({ to: "/review/inbox" });
  };

  return (
    <div>
      <PageHeader
        title={`Review ${reg.ticketId}`}
        subtitle={`${reg.tipeOrg} · ${reg.namaOrg}`}
        action={
          <Link to="/review/inbox" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Inbox
          </Link>
        }
      />
      <div className="grid gap-5 p-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm text-muted-foreground">{reg.ticketId}</p>
                <h2 className="mt-1 text-lg font-bold">{reg.namaOrg}</h2>
                <p className="text-sm text-muted-foreground">{reg.tipeOrg} · {reg.pw}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={reg.status} />
                <JalurBadge jalur={reg.jalur} />
              </div>
            </div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              {reg.jalur === "A" && <Info label="Kode Akses" value={reg.accessCode ?? "—"} mono />}
              {reg.jalur === "B" && <Info label="Didaftarkan oleh" value={reg.sourcePcName ?? "—"} />}
              <Info label="Nama Administrator" value={reg.namaAdmin} />
              <Info label="Jabatan" value={reg.jabatan} />
              <Info label="NIK" value={reg.nik} mono />
              <Info label="Nomor HP" value={reg.hp} />
              <Info label="Email" value={reg.email} />
              <Info label="Submit" value={formatDateTime(reg.submittedAt)} />
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Surat Tugas</p>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${reg.sumberSuratTugas === "DIGDAYA_PERSURATAN" ? "bg-[oklch(0.94_0.06_150)] text-[oklch(0.36_0.10_152)]" : "bg-secondary text-muted-foreground"}`}>
                {reg.sumberSuratTugas === "DIGDAYA_PERSURATAN" ? "Dari Sistem" : "Upload Manual"}
              </span>
            </div>
            {reg.sumberSuratTugas === "DIGDAYA_PERSURATAN" && reg.dokumenSistem ? (
              <div className="mt-3 rounded-md border border-primary/30 bg-accent/40 p-4 space-y-1.5">
                <p className="text-[15px] font-semibold text-foreground">{reg.dokumenSistem.namaDokumen}</p>
                <p className="text-[12px] text-muted-foreground">Nomor: <span className="font-mono">{reg.dokumenSistem.nomorSurat}</span></p>
                <p className="text-[12px] text-muted-foreground">Tanggal: {new Date(reg.dokumenSistem.tanggalSurat).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                <p className="text-[12px] text-muted-foreground">Penandatangan: {reg.dokumenSistem.penandatangan}</p>
                <p className="text-[12px] text-muted-foreground">Status: {reg.dokumenSistem.status}</p>
                <Button type="button" variant="outline" size="sm" className="mt-2 h-8 text-[12px]">Lihat Dokumen</Button>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-3 rounded-md border border-dashed border-border bg-secondary/30 p-6">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{reg.suratTugasFile ?? "surat-tugas.pdf"}</p>
                  <p className="text-xs text-muted-foreground">Preview dokumen (mock)</p>
                </div>
              </div>
            )}
          </div>

          {reg.status === "Pending" && (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Tindakan Review</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => setApproveOpen(true)} className="bg-success text-success-foreground hover:bg-success/90">
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Setujui Pendaftaran
                </Button>
                <Button variant="outline" onClick={() => setRejectOpen(true)} className="border-destructive/40 text-destructive hover:bg-destructive/5">
                  <XCircle className="mr-1 h-4 w-4" /> Tolak Pendaftaran
                </Button>
              </div>
            </div>
          )}

          {(reg.status === "PerluPerbaikan" || reg.status === "RejectedFinal") && reg.rejectReason && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-destructive">Alasan Penolakan</p>
              <p className="mt-1 text-sm">{reg.rejectReason}</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Timeline</p>
            <ol className="mt-3 space-y-3 text-sm">
              <TLine done label="Pendaftaran diterima" sub={formatDateTime(reg.submittedAt)} />
              <TLine done={reg.status !== "Pending"} label={reg.status === "Pending" ? "Menunggu review" : "Review selesai"} sub={reg.reviewedAt ? formatDateTime(reg.reviewedAt) : "—"} />
              <TLine done={reg.status === "Approved"} label="Akun dibuat (menunggu aktivasi)" sub={reg.status === "Approved" ? "Auto-provisioning OK" : "—"} />
              <TLine done={!!reg.peruriBatchId} label="Masuk batch Peruri" sub={reg.peruriBatchId ?? "—"} />
            </ol>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Audit Trail Tiket</p>
            <ul className="mt-3 space-y-3 text-xs">
              {audit.length === 0 && <li className="text-muted-foreground">Belum ada catatan.</li>}
              {audit.map((a) => (
                <li key={a.id} className="border-l-2 border-border pl-3">
                  <div className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" />{formatDateTime(a.timestamp)}</div>
                  <p className="mt-1 font-mono text-[10px] font-semibold text-primary-dark">{a.action}</p>
                  <p className="text-foreground">{a.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Setujui pendaftaran ini?</DialogTitle>
            <DialogDescription>Akun administrator akan dibuat otomatis dan masuk batch Peruri.{reg.jalur === "A" && " Kode akses akan ditandai 'Sudah Digunakan'."}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>Batal</Button>
            <Button onClick={doApprove} disabled={busy}>Ya, Setujui</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tolak Pendaftaran</DialogTitle>
            <DialogDescription>Alasan akan dikirim ke pendaftar agar bisa memperbaiki data.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Tuliskan alasan penolakan yang jelas dan actionable…" value={reason} onChange={(e) => setReason(e.target.value)} rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Batal</Button>
            <Button onClick={doReject} disabled={busy} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Tolak</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-medium text-foreground ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function TLine({ done, label, sub }: { done?: boolean; label: string; sub: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${done ? "border-primary bg-primary" : "border-border bg-card"}`} />
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </li>
  );
}
