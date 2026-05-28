import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KPI } from "@/components/dashboard/KPI";
import { useStore } from "@/lib/store";
import { SLABadge } from "@/components/SLABadge";
import { JalurBadge } from "@/components/JalurBadge";
import { daysSinceSubmit, formatDate, slaBucket } from "@/utils/status";
import { Timer, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

export const Route = createFileRoute("/review/sla")({
  component: SLAPage,
});

function SLAPage() {
  const regs = useStore((s) => s.registrations);
  const sla = useStore((s) => s.sla);
  const reviewed = regs.filter((r) => r.reviewedAt);
  const avg = reviewed.length ? reviewed.reduce((acc, r) => acc + daysSinceSubmit(r), 0) / reviewed.length : 0;
  const inSla = reviewed.filter((r) => daysSinceSubmit(r) <= sla.yellowMaxDays).length;
  const pending = regs.filter((r) => r.status === "Pending");
  const overSla = pending.filter((r) => slaBucket(r, sla.greenMaxDays, sla.yellowMaxDays) === "Lewat");
  const near = pending.filter((r) => slaBucket(r, sla.greenMaxDays, sla.yellowMaxDays) === "Mendekati");

  return (
    <div>
      <PageHeader title="SLA Monitoring" subtitle="Pantauan performa review Tim Digdaya." />
      <div className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPI label="Rata-rata Waktu Review" value={`${avg.toFixed(1)} hari`} icon={Clock} />
          <KPI label="% Review dalam SLA" value={reviewed.length ? `${Math.round((inSla / reviewed.length) * 100)}%` : "—"} icon={CheckCircle2} tone="success" />
          <KPI label="Pending > 3 hari" value={overSla.length} icon={AlertTriangle} tone="destructive" />
          <KPI label="Pending Mendekati SLA" value={near.length} icon={Timer} tone="warning" />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Tiket</th>
                <th className="px-4 py-3">Sumber Pengajuan</th>
                <th className="px-4 py-3">Organisasi</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Submit</th>
                <th className="px-4 py-3">Lama Menunggu</th>
                <th className="px-4 py-3">SLA</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((r) => (
                <tr key={r.ticketId} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{r.ticketId}</td>
                  <td className="px-4 py-3"><JalurBadge jalur={r.jalur} /></td>
                  <td className="px-4 py-3">{r.namaOrg}</td>
                  <td className="px-4 py-3 text-xs">{r.tipeOrg}</td>
                  <td className="px-4 py-3 text-xs">{formatDate(r.submittedAt)}</td>
                  <td className="px-4 py-3 text-xs">{Math.floor(daysSinceSubmit(r))} hari</td>
                  <td className="px-4 py-3"><SLABadge bucket={slaBucket(r, sla.greenMaxDays, sla.yellowMaxDays)} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/review/inbox/$ticketId" params={{ ticketId: r.ticketId }} className="text-xs font-medium text-primary-dark hover:underline">Review →</Link>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">Tidak ada pendaftaran yang melewati SLA. Semua proses masih terkendali.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
