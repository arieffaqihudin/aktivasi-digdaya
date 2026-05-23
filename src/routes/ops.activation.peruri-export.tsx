import { createFileRoute } from "@tanstack/react-router";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { actions, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, FileDown } from "lucide-react";
import { formatDateTime } from "@/utils/status";

export const Route = createFileRoute("/ops/activation/peruri-export")({
  component: PeruriExport,
});

function PeruriExport() {
  const batches = useStore((s) => s.batches);
  const regs = useStore((s) => s.registrations);
  const [busy, setBusy] = useState(false);

  const pending = regs.filter((r) => r.status === "Approved" && !r.peruriBatchId).length;

  const generate = async () => {
    setBusy(true); await new Promise((r) => setTimeout(r, 600));
    const b = actions.generatePeruriBatch(); setBusy(false);
    if (!b) toast.error("Tidak ada record approved baru.");
    else toast.success(`Batch ${b.id} dibuat (${b.count} record).`);
  };

  const download = (batchId: string) => {
    const batch = batches.find((b) => b.id === batchId); if (!batch) return;
    const records = regs.filter((r) => batch.ticketIds.includes(r.ticketId));
    const rows = [["Ticket","Jalur","TipeOrg","NamaOrg","NamaAdmin","Jabatan","Email","HP"]];
    records.forEach((r) => rows.push([r.ticketId, r.jalur, r.tipeOrg, r.namaOrg, r.namaAdmin, r.jabatan, r.email, r.hp]));
    const csv = rows.map((r) => r.map((x) => `"${x}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${batch.id}.csv`; a.click(); URL.revokeObjectURL(url);
    actions.markBatchDownloaded(batch.id);
    toast.success(`${batch.id} berhasil diunduh.`);
  };

  return (
    <div>
      <OpsPageHeader title="Export Peruri" subtitle="Batch harian untuk provisioning Peruri." breadcrumb={[{ label: "Aktivasi Digdaya", to: "/ops/activation" }, { label: "Export Peruri" }]} />
      <OpsPageBody>
        <OpsCard
          title="Generate Export Peruri"
          description="Export berisi pengajuan yang sudah disetujui dan belum pernah masuk batch."
          action={<Button size="sm" onClick={generate} disabled={busy || pending === 0}>{busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}<FileDown className="mr-1 h-4 w-4" /> Generate Batch Hari Ini ({pending})</Button>}
        >
          <p className="text-[12.5px] text-muted-foreground">Format final menunggu template resmi Peruri.</p>
        </OpsCard>

        <OpsCard title="Riwayat Batch">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-secondary/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5">Batch ID</th>
                  <th className="px-3 py-2.5">Tanggal</th>
                  <th className="px-3 py-2.5">Jumlah</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Generated</th>
                  <th className="px-3 py-2.5">Downloaded By</th>
                  <th className="px-3 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {batches.length === 0 && <tr><td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">Belum ada batch.</td></tr>}
                {batches.map((b) => (
                  <tr key={b.id} className="border-t border-border">
                    <td className="px-3 py-2.5 font-mono text-xs">{b.id}</td>
                    <td className="px-3 py-2.5 text-xs">{b.date}</td>
                    <td className="px-3 py-2.5 font-semibold">{b.count}</td>
                    <td className="px-3 py-2.5 text-xs">{b.status}</td>
                    <td className="px-3 py-2.5 text-xs">{formatDateTime(b.generatedAt)}</td>
                    <td className="px-3 py-2.5 text-xs">{b.downloadedBy ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right">
                      <Button size="sm" onClick={() => download(b.id)}><Download className="mr-1 h-3.5 w-3.5" /> CSV</Button>
                    </td>
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
