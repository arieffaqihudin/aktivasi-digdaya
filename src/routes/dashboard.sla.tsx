import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KPI } from "@/components/dashboard/KPI";
import { StatusBadge } from "@/components/StatusBadge";
import { SLABadge } from "@/components/SLABadge";
import { Button } from "@/components/ui/button";
import { slaBucket, daysSinceSubmit, formatDate } from "@/utils/status";
import { Timer, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/dashboard/sla")({
  component: SLAPage,
});

function SLAPage() {
  const regs = useStore((s) => s.registrations);
  const sla = useStore((s) => s.sla);

  const reviewed = regs.filter((r) => r.reviewedAt);
  const avg = reviewed.length ? (reviewed.reduce((a, r) => a + daysSinceSubmit(r), 0) / reviewed.length).toFixed(1) : "0";
  const within = reviewed.filter((r) => daysSinceSubmit(r) <= sla.yellowMaxDays).length;
  const pct = reviewed.length ? Math.round((within / reviewed.length) * 100) : 0;
  const pendingOver = regs.filter((r) => r.status === "Pending" && daysSinceSubmit(r) > sla.yellowMaxDays);
  const watchlist = regs.filter((r) => r.status === "Pending" && slaBucket(r, sla.greenMaxDays, sla.yellowMaxDays) !== "Aman")
    .sort((a, b) => +new Date(a.submittedAt) - +new Date(b.submittedAt));

  return (
    <div>
      <PageHeader title="SLA Monitoring" subtitle={`SLA default: ${sla.defaultDays} hari kerja per pendaftaran.`} />
      <div className="space-y-6 px-6 pb-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPI label="Rata-rata Waktu Review" value={`${avg} hari`} icon={Timer} tone="primary" />
          <KPI label="Review dalam SLA" value={`${pct}%`} icon={CheckCircle2} tone="success" />
          <KPI label="Pending > 3 Hari" value={pendingOver.length} icon={AlertTriangle} tone="destructive" />
          <KPI label="Pendaftaran Direview" value={reviewed.length} icon={ShieldCheck} tone="info" />
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3"><h2 className="text-sm font-semibold">Watchlist SLA</h2></div>
          {watchlist.length === 0 ? (
            <div className="p-10 text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-success" />
              <p className="mt-3 text-sm font-medium">Tidak ada pendaftaran yang melewati SLA.</p>
              <p className="mt-1 text-xs text-muted-foreground">Semua proses masih terkendali.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">Tiket</th><th className="px-4 py-3 text-left">Kepengurusan</th><th className="px-4 py-3 text-left">Submit</th><th className="px-4 py-3 text-left">Lama</th><th className="px-4 py-3 text-left">SLA</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {watchlist.map((r) => (
                  <tr key={r.ticketId}>
                    <td className="px-4 py-3 font-mono text-xs">{r.ticketId}</td>
                    <td className="px-4 py-3 font-medium">{r.namaKepengurusan}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(r.submittedAt)}</td>
                    <td className="px-4 py-3">{Math.floor(daysSinceSubmit(r))} hari</td>
                    <td className="px-4 py-3"><SLABadge bucket={slaBucket(r, sla.greenMaxDays, sla.yellowMaxDays)} /></td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-right"><Link to="/dashboard/review/$ticketId" params={{ ticketId: r.ticketId }}><Button size="sm" variant="outline">Review</Button></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
