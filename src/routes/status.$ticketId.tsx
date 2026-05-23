import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { useStore } from "@/lib/store";
import { StatusBadge, STATUS_COPY } from "@/components/StatusBadge";
import { JalurBadge } from "@/components/JalurBadge";
import { formatDateTime } from "@/utils/status";
import { Button } from "@/components/ui/button";
import { REJECTION_CATEGORY_LABEL } from "@/data/mockData";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  RefreshCw,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/status/$ticketId")({
  head: ({ params }) => ({
    meta: [
      { title: `Status ${params.ticketId} — Portal Aktivasi Digdaya` },
      { name: "description", content: "Detail status pendaftaran administrator Digdaya." },
    ],
  }),
  component: StatusDetail,
});

function StatusDetail() {
  const { ticketId } = Route.useParams();
  const reg = useStore((s) => s.registrations.find((r) => r.ticketId === ticketId));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <Link to="/cek-status" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Cek tiket lain
          </Link>

          {!reg ? (
            <div className="mt-6 rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-base font-semibold">Tiket tidak ditemukan</p>
              <p className="mt-1 text-sm text-muted-foreground">Periksa kembali nomor tiket Anda.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
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
                  <p className="text-sm text-foreground">{STATUS_COPY[reg.status]}</p>
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
                    <p className="mt-1 text-sm text-foreground">{reg.rejectReason}</p>
                  </div>
                )}

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <Info label="Nama Organisasi" value={reg.namaOrg} />
                  <Info label="Tipe Organisasi" value={reg.tipeOrg} />
                  <Info label="Wilayah PW" value={reg.pw} />
                  {reg.sourcePcName && <Info label="Didaftarkan oleh" value={reg.sourcePcName} />}
                  <Info label="Nama Administrator" value={reg.namaAdmin} />
                  <Info label="Jabatan" value={reg.jabatan} />
                  <Info label="Email" value={reg.email} />
                  <Info label="Tanggal Submit" value={formatDateTime(reg.submittedAt)} />
                </dl>
              </div>

              {reg.status === "PerluPerbaikan" && reg.jalur === "A" && (
                <Link to="/status/$ticketId/revisi" params={{ ticketId: reg.ticketId }}>
                  <Button className="w-full sm:w-auto">
                    <RefreshCw className="mr-1.5 h-4 w-4" /> Perbaiki Pengajuan
                  </Button>
                </Link>
              )}

              {reg.status === "RejectedFinal" && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground">
                  <p className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Pengajuan ini tidak dapat dilanjutkan.
                  </p>
                  <p className="mt-1 text-muted-foreground">Silakan hubungi Tim Digdaya PBNU jika membutuhkan bantuan.</p>
                </div>
              )}

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold">Linimasa Pengajuan</h2>
                <ol className="mt-4 space-y-3">
                  <Timeline icon={ClipboardCheck} active label="Pengajuan dikirim" sub={formatDateTime(reg.submittedAt)} />
                  {(reg.revisionHistory ?? []).map((h, i) => (
                    <Timeline
                      key={i}
                      icon={h.decision === "RejectedFinal" ? XCircle : RefreshCw}
                      active
                      error={h.decision === "RejectedFinal"}
                      label={h.decision === "RejectedFinal" ? "Ditolak final oleh reviewer" : "Reviewer meminta perbaikan"}
                      sub={`${formatDateTime(h.at)} — ${h.note}`}
                    />
                  ))}
                  {(reg.resubmitHistory ?? []).map((h, i) => (
                    <Timeline
                      key={`r${i}`}
                      icon={RefreshCw}
                      active
                      label={`Pendaftar mengirim revisi ke-${i + 1}`}
                      sub={`${formatDateTime(h.at)}${h.changedFields.length ? ` — ${h.changedFields.join(", ")}` : ""}`}
                    />
                  ))}
                  <Timeline
                    icon={reg.status === "Approved" ? CheckCircle2 : CalendarClock}
                    active={reg.status === "Approved"}
                    label={
                      reg.status === "Approved"
                        ? "Pengajuan disetujui"
                        : reg.status === "Pending"
                          ? "Menunggu review Tim Digdaya"
                          : reg.status === "PerluPerbaikan"
                            ? "Menunggu perbaikan dari pendaftar"
                            : "Pengajuan ditolak final"
                    }
                    sub={reg.reviewedAt ? formatDateTime(reg.reviewedAt) : "Maks. 3 hari kerja"}
                  />
                </ol>
              </div>
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium text-foreground">{value}</p>
    </div>
  );
}

function Timeline({
  icon: Icon, label, sub, active, error,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; sub: string; active?: boolean; error?: boolean;
}) {
  const cls = error
    ? "bg-destructive/10 text-destructive border-destructive/30"
    : active
      ? "bg-primary text-primary-foreground border-primary"
      : "bg-secondary text-muted-foreground border-border";
  return (
    <li className="flex items-start gap-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${cls}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </li>
  );
}
