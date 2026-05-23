import { createFileRoute } from "@tanstack/react-router";
import { useStore, actions } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Download, FileDown, Eye, FileSpreadsheet } from "lucide-react";
import { formatDateTime } from "@/utils/status";
import type { PeruriBatch } from "@/data/mockData";

export const Route = createFileRoute("/dashboard/peruri")({
  component: PeruriPage,
});

function PeruriPage() {
  const batches = useStore((s) => s.batches);
  const regs = useStore((s) => s.registrations);
  const [view, setView] = useState<PeruriBatch | null>(null);

  const generate = () => {
    const b = actions.generatePeruriBatch();
    if (!b) { toast.info("Tidak ada pendaftaran approved yang belum masuk batch."); return; }
    toast.success(`Batch ${b.id} berhasil dibuat (${b.count} record).`);
  };

  const download = (b: PeruriBatch) => {
    const rows = b.ticketIds.map((id) => regs.find((r) => r.ticketId === id)).filter(Boolean) as any[];
    const headers = ["Nama Administrator", "Jabatan", "Email", "Nomor HP", "Nama Kepengurusan", "Tingkat", "Nomor Tiket"];
    const csv = [headers.join(","), ...rows.map((r) => [r.namaAdmin, r.jabatan, r.email, r.hp, r.namaKepengurusan, r.tingkat, r.ticketId].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${b.id}.csv`; a.click();
    URL.revokeObjectURL(url);
    actions.markBatchDownloaded(b.id);
    toast.success(`${b.id} diunduh.`);
  };

  return (
    <div>
      <PageHeader
        title="Export Peruri"
        subtitle="Batch harian otomatis pukul 16.00 WIB. Untuk demo, batch dapat dibuat manual."
        action={<Button onClick={generate}><FileDown className="mr-1 h-4 w-4" /> Generate Batch Hari Ini</Button>}
      />
      <div className="space-y-4 px-6 pb-10">
        <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-primary-dark">
          Format final menunggu template resmi Peruri. Kolom saat ini menggunakan format sementara berdasarkan kebutuhan minimal.
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Batch ID</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Record</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Generated</th>
                <th className="px-4 py-3 text-left">Downloaded By</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs text-primary-dark">{b.id}</td>
                  <td className="px-4 py-3">{b.date}</td>
                  <td className="px-4 py-3 font-medium">{b.count}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${b.status === "Ready" ? "border-warning/40 bg-warning/15 text-warning-foreground" : "border-success/30 bg-success/15 text-success"}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(b.generatedAt)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{b.downloadedBy ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setView(b)}><Eye className="mr-1 h-3.5 w-3.5" /> Lihat</Button>
                      <Button size="sm" onClick={() => download(b)}><Download className="mr-1 h-3.5 w-3.5" /> Excel</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center"><FileSpreadsheet className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-2 text-sm text-muted-foreground">Belum ada batch. Klik "Generate Batch Hari Ini".</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Isi {view?.id}</DialogTitle></DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full text-xs">
              <thead className="bg-secondary text-[11px] uppercase tracking-wider text-muted-foreground"><tr>
                <th className="px-2 py-2 text-left">Admin</th><th className="px-2 py-2 text-left">Jabatan</th><th className="px-2 py-2 text-left">Email</th><th className="px-2 py-2 text-left">HP</th><th className="px-2 py-2 text-left">Kepengurusan</th><th className="px-2 py-2 text-left">Tingkat</th><th className="px-2 py-2 text-left">Tiket</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {view?.ticketIds.map((id) => {
                  const r = regs.find((x) => x.ticketId === id); if (!r) return null;
                  return <tr key={id}><td className="px-2 py-2">{r.namaAdmin}</td><td className="px-2 py-2">{r.jabatan}</td><td className="px-2 py-2">{r.email}</td><td className="px-2 py-2">{r.hp}</td><td className="px-2 py-2">{r.namaKepengurusan}</td><td className="px-2 py-2">{r.tingkat}</td><td className="px-2 py-2 font-mono">{r.ticketId}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
