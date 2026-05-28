import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge, STATUS_COPY } from "@/components/StatusBadge";
import { JalurBadge } from "@/components/JalurBadge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/utils/status";
import { REJECTION_CATEGORY_LABEL } from "@/data/mockData";
import {
  ArrowLeft, CalendarClock, CheckCircle2, ClipboardCheck,
  RefreshCw, XCircle, AlertTriangle,
} from "lucide-react";

export function InternalStatusDetail({ ticketId, scope }: { ticketId: string; scope: "pw" | "pc" }) {
  const reg = useStore((s) => s.registrations.find((r) => r.ticketId === ticketId));
  const listPath = scope === "pw" ? "/pw/status-pengajuan" : "/pc/status-pengajuan";
  const revisiPath = scope === "pw" ? "/pw/status-pengajuan/$ticketId/revisi" : "/pc/status-pengajuan/$ticketId/revisi";

  return (
    <div>
      <PageHeader
        title={`Detail Pengajuan ${ticketId}`}
        breadcrumb={[
          { label: scope.toUpperCase(), to: scope === "pw" ? "/pw" : "/pc" },
          { label: "Status Pengajuan", to: listPath },
          { label: ticketId },
        ]}
        subtitle="Rincian pengajuan aktivasi organisasi."
      />
      <div className="p-4 sm:p-6 max-w-7xl">
        <Link to={listPath} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali ke daftar
        </Link>

        {!reg ? (
          <div className="mt-6 rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-base font-semibold">Pengajuan tidak ditemukan</p>
            <p className="mt-1 text-sm text-muted-foreground">Periksa kembali nomor tiket.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:items-start">
            <div className="space-y-5 min-w-0">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nomor Tiket</p>
                    <p className="mt-1 font-mono text-lg font-bold text-primary-dark">{reg.ticketId}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={reg.status} />
                    <JalurBadge jalur={reg.jalur} />
                    {(reg.revisionCount ?? 0) > 0 && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Revisi ke-{reg.revisionCount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 rounded-md border border-border bg-secondary/30 p-4">
                  <p className="text-sm">{STATUS_COPY[reg.status]}</p>
                </div>

                {(reg.status === "PerluPerbaikan" || reg.status === "RejectedFinal") && reg.rejectReason && (
                  <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
                      Catatan Reviewer
                      {reg.rejectionCategory && (
                        <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal">
                          {REJECTION_CATEGORY_LABEL[reg.rejectionCategory]}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm">{reg.rejectReason}</p>
                  </div>
                )}

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <Info label="Nama Organisasi" value={reg.namaOrg} />
                  <Info label="Tipe Organisasi" value={reg.tipeOrg} />
                  {reg.tipeOrg === "Ranting" && reg.parentMwcName && <Info label="MWC Induk" value={reg.parentMwcName} />}
                  {reg.tipeOrg === "Ranting" && reg.sourcePcName && <Info label="PC Induk" value={reg.sourcePcName} />}
                  {reg.tipeOrg === "Ranting" && reg.village && <Info label="Wilayah / Desa" value={reg.village} />}
                  {reg.tipeOrg !== "Ranting" && <Info label="Wilayah PW" value={reg.pw} />}
                  {reg.sourcePcName && reg.tipeOrg !== "Ranting" && <Info label="Didaftarkan oleh" value={reg.sourcePcName} />}
                  <Info label="Nama Administrator" value={reg.namaAdmin} />
                  <Info label="Jabatan" value={reg.jabatan} />
                  <Info label="Email" value={reg.email} />
                  <Info label="Tanggal Submit" value={formatDateTime(reg.submittedAt)} />
                </dl>
              </div>

              {reg.status === "PerluPerbaikan" && (
                <Link to={revisiPath} params={{ ticketId: reg.ticketId }}>
                  <Button className="w-full sm:w-auto">
                    <RefreshCw className="mr-1.5 h-4 w-4" /> Perbaiki Pengajuan
                  </Button>
                </Link>
              )}

              {reg.status === "RejectedFinal" && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
                  <p className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Pengajuan ini tidak dapat dilanjutkan.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-6 lg:sticky lg:top-6">
              <h2 className="text-sm font-semibold">Linimasa Pengajuan</h2>
              <ol className="mt-4 space-y-3">
                <TL icon={ClipboardCheck} active label="Pengajuan dikirim" sub={formatDateTime(reg.submittedAt)} />
                {(reg.revisionHistory ?? []).map((h, i) => (
                  <TL key={i} icon={h.decision === "RejectedFinal" ? XCircle : RefreshCw} active
                    error={h.decision === "RejectedFinal"}
                    label={h.decision === "RejectedFinal" ? "Ditolak final oleh reviewer" : "Reviewer meminta perbaikan"}
                    sub={`${formatDateTime(h.at)} — ${h.note}`} />
                ))}
                {(reg.resubmitHistory ?? []).map((h, i) => (
                  <TL key={`r${i}`} icon={RefreshCw} active
                    label={`Pendaftar mengirim revisi ke-${i + 1}`}
                    sub={`${formatDateTime(h.at)}${h.changedFields.length ? ` — ${h.changedFields.join(", ")}` : ""}`} />
                ))}
                <TL icon={reg.status === "Approved" ? CheckCircle2 : CalendarClock}
                  active={reg.status === "Approved"}
                  label={
                    reg.status === "Approved" ? "Pengajuan disetujui"
                      : reg.status === "Pending" ? "Menunggu review Tim Digdaya"
                      : reg.status === "PerluPerbaikan" ? "Menunggu perbaikan dari pendaftar"
                      : "Pengajuan ditolak final"
                  }
                  sub={reg.reviewedAt ? formatDateTime(reg.reviewedAt) : "Pengajuan akan direview oleh Tim Digdaya"} />
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}

function TL({ icon: Icon, label, sub, active, error }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; sub: string; active?: boolean; error?: boolean;
}) {
  const cls = error
    ? "bg-destructive/10 text-destructive border-destructive/30"
    : active ? "bg-primary text-primary-foreground border-primary"
    : "bg-secondary text-muted-foreground border-border";
  return (
    <li className="flex items-start gap-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${cls}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </li>
  );
}
