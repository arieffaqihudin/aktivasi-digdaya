import { createFileRoute } from "@tanstack/react-router";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { formatDateTime } from "@/utils/status";

export const Route = createFileRoute("/ops/activation/audit-log")({
  component: AuditLog,
});

function AuditLog() {
  const audit = useStore((s) => s.audit);
  const [q, setQ] = useState("");
  const [actionF, setActionF] = useState("");

  const actions = Array.from(new Set(audit.map((a) => a.action)));

  const filtered = useMemo(() => audit
    .filter((a) => !q || a.actor.toLowerCase().includes(q.toLowerCase()) || (a.ticketId ?? "").toLowerCase().includes(q.toLowerCase()) || a.detail.toLowerCase().includes(q.toLowerCase()))
    .filter((a) => !actionF || a.action === actionF),
    [audit, q, actionF]);

  return (
    <div>
      <OpsPageHeader title="Audit Log Aktivasi" subtitle="Catatan seluruh aksi pada modul aktivasi. Tidak dapat dihapus." breadcrumb={[{ label: "Aktivasi Digdaya", to: "/ops/activation" }, { label: "Audit Log" }]} />
      <OpsPageBody>
        <OpsCard>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:flex-1 sm:min-w-[240px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari actor / tiket / detail" value={q} onChange={(e) => setQ(e.target.value)} className="h-10 w-full pl-9" />
            </div>
            <select value={actionF} onChange={(e) => setActionF(e.target.value)} className="h-10 rounded-md border border-border bg-card px-3 text-[13px] outline-none focus:border-primary">
              <option value="">Semua Action</option>
              {actions.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </OpsCard>

        <OpsCard className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-secondary/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Detail</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Tidak ada catatan.</td></tr>}
                {filtered.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(a.timestamp)}</td>
                    <td className="px-4 py-3 text-xs">{a.actor}</td>
                    <td className="px-4 py-3 text-xs">{a.role}</td>
                    <td className="px-4 py-3"><span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary-dark">{a.action}</span></td>
                    <td className="px-4 py-3 font-mono text-xs">{a.ticketId ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{a.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </OpsCard>
      </OpsPageBody>
    </div>
  );
}
