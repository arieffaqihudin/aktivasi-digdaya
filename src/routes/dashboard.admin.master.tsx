import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { masterKepengurusan } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/admin/master")({
  component: MasterData,
});

function MasterData() {
  const [q, setQ] = useState("");
  const data = masterKepengurusan.filter((m) => !q || m.nama.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Master Data Kepengurusan" subtitle="Daftar kepengurusan NU yang tersedia di Portal Aktivasi." />
      <div className="space-y-4 px-6 pb-10">
        <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-primary-dark">
          Disarankan terhubung live dengan API Digdaya Kepengurusan untuk akurasi data.
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kepengurusan…" className="pl-9" />
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">Nama</th><th className="px-4 py-3 text-left">Tingkat</th><th className="px-4 py-3 text-left">PW</th><th className="px-4 py-3 text-left">PC Induk</th><th className="px-4 py-3 text-left">MWC Induk</th><th className="px-4 py-3 text-left">Status Data</th><th className="px-4 py-3 text-right">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((m) => (
                <tr key={m.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{m.nama}</td>
                  <td className="px-4 py-3"><span className="rounded bg-secondary px-1.5 py-0.5 text-[11px] font-medium">{m.tingkat}</span></td>
                  <td className="px-4 py-3 text-xs">{m.pw}</td>
                  <td className="px-4 py-3 text-xs">{m.pcInduk ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{m.mwcInduk ?? "—"}</td>
                  <td className="px-4 py-3"><span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${m.statusData === "Aktif" ? "border-success/30 bg-success/15 text-success" : "border-warning/40 bg-warning/15 text-warning-foreground"}`}>{m.statusData}</span></td>
                  <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost">Detail</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
