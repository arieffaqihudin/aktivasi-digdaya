import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { formatDateTime } from "@/utils/status";

export const Route = createFileRoute("/dashboard/audit-log")({
  component: AuditLog,
});

const actionLabels: Record<string, { label: string; tone: string }> = {
  SUBMIT_REGISTRATION: { label: "Submit Pendaftaran", tone: "bg-info/15 text-info border-info/30" },
  APPROVE_REGISTRATION: { label: "Approve", tone: "bg-success/15 text-success border-success/30" },
  REJECT_REGISTRATION: { label: "Reject", tone: "bg-destructive/10 text-destructive border-destructive/30" },
  GENERATE_PERURI_BATCH: { label: "Generate Batch", tone: "bg-primary/10 text-primary-dark border-primary/30" },
  DOWNLOAD_PERURI_BATCH: { label: "Download Batch", tone: "bg-secondary text-foreground border-border" },
  UPDATE_SLA_SETTING: { label: "Update SLA", tone: "bg-warning/15 text-warning-foreground border-warning/30" },
};

function AuditLog() {
  const audit = useStore((s) => s.audit);
  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Seluruh aksi yang terjadi pada Portal Aktivasi Digdaya. Tidak dapat dihapus." />
      <div className="px-6 pb-10">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">Waktu</th><th className="px-4 py-3 text-left">Aktor</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Aksi</th><th className="px-4 py-3 text-left">Tiket</th><th className="px-4 py-3 text-left">Detail</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {audit.map((a) => {
                const m = actionLabels[a.action] ?? { label: a.action, tone: "bg-secondary text-foreground border-border" };
                return (
                  <tr key={a.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(a.timestamp)}</td>
                    <td className="px-4 py-3 text-xs">{a.actor}</td>
                    <td className="px-4 py-3 text-xs">{a.role}</td>
                    <td className="px-4 py-3"><span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${m.tone}`}>{m.label}</span></td>
                    <td className="px-4 py-3 font-mono text-xs">{a.ticketId ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">{a.detail}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
