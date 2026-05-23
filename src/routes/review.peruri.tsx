import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { actions, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2, FileDown } from "lucide-react";
import { formatDateTime } from "@/utils/status";

export const Route = createFileRoute("/review/peruri")({
  component: PeruriPage,
});

function PeruriPage() {
  const batches = useStore((s) => s.batches);
  const regs = useStore((s) => s.registrations);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const pending = regs.filter((r) => r.status === "Approved" && !r.peruriBatchId).length;

  const generate = async () => {
    setBusy(true); await new Promise((r) => setTimeout(r, 600));
    const b = actions.generatePeruriBatch(); setBusy(false);
    if (!b) toast.error("Tidak ada record approved baru untuk dibatch.");
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
      <PageHeader title="Export Peruri" subtitle="Batch harian untuk provisioning Peruri. Default jadwal 16:00 WIB."
        action={<Button onClick={generate} disabled={busy || pending === 0}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} <FileDown className="mr-1 h-4 w-4" /> Generate Batch Hari Ini ({pending})</Button>}
      />
      <div className="space-y-4 p-6">
        <div className="rounded-md border border-info/30 bg-info/5 p-3 text-xs text-muted-foreground">
          Format final menunggu template resmi Peruri. Kolom saat ini menggunakan format sementara.
        </div>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Batch ID</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jumlah</th>
                <th className="px-4 py-3">Jalur A</th>
                <th className="px-4 py-3">Jalur B</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Generated</th>
                <th className="px-4 py-3">Downloaded By</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <React.Fragment key={b.id}>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs">{b.id}</td>
                    <td className="px-4 py-3 text-xs">{b.date}</td>
                    <td className="px-4 py-3 font-semibold">{b.count}</td>
                    <td className="px-4 py-3 text-xs">{b.countA}</td>
                    <td className="px-4 py-3 text-xs">{b.countB}</td>
                    <td className="px-4 py-3 text-xs">{b.status}</td>
                    <td className="px-4 py-3 text-xs">{formatDateTime(b.generatedAt)}</td>
                    <td className="px-4 py-3 text-xs">{b.downloadedBy ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setOpen(open === b.id ? null : b.id)}>{open === b.id ? "Tutup" : "Lihat"}</Button>
                        <Button size="sm" onClick={() => download(b.id)}><Download className="mr-1 h-3.5 w-3.5" /> CSV</Button>
                      </div>
                    </td>
                  </tr>
                  {open === b.id && (
                    <tr><td colSpan={9} className="bg-secondary/20 px-4 py-3">
                      <div className="overflow-x-auto rounded-md border border-border bg-card">
                        <table className="w-full text-xs">
                          <thead className="bg-secondary/40 text-left uppercase text-muted-foreground">
                            <tr><th className="px-3 py-2">Tiket</th><th className="px-3 py-2">Jalur</th><th className="px-3 py-2">Tipe</th><th className="px-3 py-2">Organisasi</th><th className="px-3 py-2">Admin</th><th className="px-3 py-2">Email</th></tr>
                          </thead>
                          <tbody>
                            {regs.filter((r) => b.ticketIds.includes(r.ticketId)).map((r) => (
                              <tr key={r.ticketId} className="border-t border-border">
                                <td className="px-3 py-2 font-mono">{r.ticketId}</td>
                                <td className="px-3 py-2">{r.jalur}</td>
                                <td className="px-3 py-2">{r.tipeOrg}</td>
                                <td className="px-3 py-2">{r.namaOrg}</td>
                                <td className="px-3 py-2">{r.namaAdmin}</td>
                                <td className="px-3 py-2">{r.email}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td></tr>
                  )}
                </>
              ))}
              {batches.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">Belum ada batch.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
