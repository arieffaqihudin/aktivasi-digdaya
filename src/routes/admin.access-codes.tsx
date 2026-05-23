import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KPI } from "@/components/dashboard/KPI";
import { actions, useStore } from "@/lib/store";
import { masterPC } from "@/data/mockData";
import { AccessCodeStatusBadge } from "@/components/JalurBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, KeyRound, Download, Plus, Ban, RotateCcw } from "lucide-react";
import { formatDate } from "@/utils/status";

export const Route = createFileRoute("/admin/access-codes")({
  component: AccessCodes,
});

function AccessCodes() {
  const codes = useStore((s) => s.accessCodes);
  const sla = useStore((s) => s.sla);
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState<string>("all");
  const [pickedPcs, setPickedPcs] = useState<string[]>([]);
  const [validDays, setValidDays] = useState(sla.defaultCodeValidDays);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState("");

  const stat = (s: string) => codes.filter((c) => c.status === s).length;

  const pws = Array.from(new Set(masterPC.map((p) => p.pw)));
  const pcOptions = masterPC.filter((p) => pw === "all" || p.pw === pw);

  const togglePc = (id: string) =>
    setPickedPcs((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);

  const generate = async () => {
    if (pickedPcs.length === 0) { toast.error("Pilih minimal 1 PC."); return; }
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 500));
    const created = actions.generateAccessCodes(pickedPcs, validDays);
    setGenerating(false);
    toast.success(`${created.length} kode akses berhasil digenerate.`);
    setOpen(false); setPickedPcs([]);
  };

  const filtered = codes.filter((c) =>
    !filter || c.code.toLowerCase().includes(filter.toLowerCase()) ||
    c.pcName.toLowerCase().includes(filter.toLowerCase())
  );

  const exportCsv = () => {
    const rows = [["Kode","PC","PW","Status","Generated","Expired","Used At","Ticket"]];
    filtered.forEach((c) => rows.push([c.code, c.pcName, c.pw, c.status, formatDate(c.generatedAt), formatDate(c.expiredAt), c.usedAt ? formatDate(c.usedAt) : "", c.ticketId ?? ""]));
    const csv = rows.map((r) => r.map((x) => `"${x}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `access-codes-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success("Ekspor CSV berhasil.");
  };

  return (
    <div>
      <PageHeader
        title="Kode Akses PC"
        subtitle="Generate dan kelola kode akses one-time untuk aktivasi PC."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCsv}><Download className="mr-1 h-4 w-4" /> Export</Button>
            <Button onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" /> Generate Kode</Button>
          </div>
        }
      />
      <div className="space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KPI label="Total Kode" value={codes.length} icon={KeyRound} />
          <KPI label="Belum Digunakan" value={stat("Unused")} tone="info" />
          <KPI label="Sudah Digunakan" value={stat("Used")} tone="success" />
          <KPI label="Kedaluwarsa" value={stat("Expired")} />
          <KPI label="Dinonaktifkan" value={stat("Disabled")} tone="destructive" />
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-3">
            <Input placeholder="Cari kode atau nama PC…" value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-md" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Kode</th>
                  <th className="px-4 py-3">PC</th>
                  <th className="px-4 py-3">PW</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Generated</th>
                  <th className="px-4 py-3">Expired</th>
                  <th className="px-4 py-3">Tiket</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.code} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                    <td className="px-4 py-3">{c.pcName}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.pw}</td>
                    <td className="px-4 py-3"><AccessCodeStatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-xs">{formatDate(c.generatedAt)}</td>
                    <td className="px-4 py-3 text-xs">{formatDate(c.expiredAt)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{c.ticketId ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button title="Copy" className="rounded p-1 hover:bg-secondary" onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Kode disalin."); }}>
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        {c.status === "Unused" && (
                          <button title="Disable" className="rounded p-1 text-destructive hover:bg-destructive/10" onClick={() => actions.disableAccessCode(c.code)}>
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {(c.status === "Disabled" || c.status === "Expired") && (
                          <button title="Regenerate" className="rounded p-1 hover:bg-secondary" onClick={() => { actions.regenerateAccessCode(c.pcId); toast.success("Kode baru digenerate."); }}>
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">Tidak ada kode akses.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Generate Kode Akses</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Filter Wilayah PW</Label>
              <Select value={pw} onValueChange={setPw}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua PW</SelectItem>
                  {pws.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Pilih PC ({pickedPcs.length} dipilih)</Label>
              <div className="mt-1.5 max-h-56 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                {pcOptions.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-secondary/50">
                    <Checkbox checked={pickedPcs.includes(p.id)} onCheckedChange={() => togglePc(p.id)} />
                    <span className="flex-1">{p.nama}</span>
                    <span className="text-xs text-muted-foreground">{p.pw.replace("PWNU ","")}</span>
                  </label>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Jika PC sudah memiliki kode aktif, kode lama akan dinonaktifkan.</p>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Masa Berlaku (hari)</Label>
              <Input type="number" min={1} value={validDays} onChange={(e) => setValidDays(Number(e.target.value))} className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={generate} disabled={generating}>Generate Kode</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
