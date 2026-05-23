import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useStore } from "@/lib/store";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/utils/status";

export const Route = createFileRoute("/pc/status-pengajuan")({
  component: StatusPengajuan,
});

function StatusPengajuan() {
  const user = useStore((s) => s.user);
  const regs = useStore((s) => s.registrations.filter((r) => r.jalur === "B" && r.sourcePcId === user?.pcId));

  return (
    <div>
      <PageHeader title="Status Pengajuan" subtitle="Semua pengajuan Jalur B dari PC Anda." />
      <div className="p-6">
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Tiket</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Organisasi</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Submit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Catatan</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {regs.map((r) => (
                <tr key={r.ticketId} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{r.ticketId}</td>
                  <td className="px-4 py-3 text-xs">{r.tipeOrg}</td>
                  <td className="px-4 py-3 font-medium">{r.namaOrg}</td>
                  <td className="px-4 py-3 text-xs">{r.namaAdmin}</td>
                  <td className="px-4 py-3 text-xs">{formatDate(r.submittedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={r.status} />
                      {r.status === "Approved" && <span className="rounded bg-info/15 px-1.5 py-0.5 text-[10px] font-medium text-info">Admin menunggu aktivasi</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs">{r.rejectReason ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {r.status === "Rejected"
                      ? <Link to="/pc/daftarkan" className="text-xs font-medium text-primary-dark hover:underline">Ajukan Ulang →</Link>
                      : <Link to="/status/$ticketId" params={{ ticketId: r.ticketId }} className="text-xs font-medium text-muted-foreground hover:text-foreground">Detail →</Link>}
                  </td>
                </tr>
              ))}
              {regs.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">Belum ada pengajuan. Mulai dengan Daftarkan Organisasi Bawahan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
