import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useStore } from "@/lib/store";
import { formatDateTime } from "@/utils/status";

export const Route = createFileRoute("/review/audit-log")({
  component: ReviewAuditLog,
});

function ReviewAuditLog() {
  const audit = useStore((s) => s.audit);

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Riwayat aktivitas review dan perubahan status pengajuan." />
      <div className="p-6">
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Tiket</th>
                <th className="px-4 py-3">Detail</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDateTime(a.timestamp)}</td>
                  <td className="px-4 py-3 text-xs">{a.actor}</td>
                  <td className="px-4 py-3 text-xs">{a.role}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary-dark">{a.action}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{a.ticketId ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{a.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
