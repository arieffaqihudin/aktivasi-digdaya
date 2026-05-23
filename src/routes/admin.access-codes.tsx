import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ListControls, FilterBar } from "@/components/dashboard/PageHeader";
import { DataTable, THead, TH, TR, TD, RowAction, EmptyRow } from "@/components/dashboard/DataTable";
import { actions, useStore } from "@/lib/store";
import { masterPC } from "@/data/mockData";
import { AccessCodeStatusBadge } from "@/components/JalurBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Download, Plus, Ban, RotateCcw, Search } from "lucide-react";
import { formatDate } from "@/utils/status";

export const Route = createFileRoute("/admin/access-codes")({
  component: AccessCodes,
});

function AccessCodes() {
  const codes = useStore((s) => s.accessCodes);
  const sla = useStore((s) => s.sla);
  const [open, setOpen] = useState(false);
  const [pwFilterModal, setPwFilterModal] = useState<string>("all");
  const [pickedPcs, setPickedPcs] = useState<string[]>([]);
  const [validDays, setValidDays] = useState(sla.defaultCodeValidDays);
  const [generating, setGenerating] = useState(false);

  const [pwFilter, setPwFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [validityFilter, setValidityFilter] = useState("all");
  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const pws = Array.from(new Set(masterPC.map((p) => p.pw)));
  const pcOptions = masterPC.filter((p) => pwFilterModal === "all" || p.pw === pwFilterModal);

  const togglePc = (id: string) =>
    setPickedPcs((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);

  const generate = async () => {
    if (pickedPcs.length === 0) { toast.error("Pilih minimal 1 PC."); return; }
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 500));
    const created = actions.generateAccessCodes(pickedPcs, "PC", validDays);
    setGenerating(false);
    toast.success(`${created.length} kode akses berhasil digenerate.`);
    setOpen(false); setPickedPcs([]);
  };

  const filtered = useMemo(() => codes
    .filter((c) => pwFilter === "all" || c.pw === pwFilter)
    .filter((c) => statusFilter === "all" || c.status === statusFilter)
    .filter((c) => {
      if (validityFilter === "all") return true;
      const days = (new Date(c.expiredAt).getTime() - Date.now()) / 86400000;
      if (validityFilter === "soon") return days >= 0 && days <= 7;
      if (validityFilter === "expired") return days < 0;
      return true;
    })
    .filter((c) => !q || c.code.toLowerCase().includes(q.toLowerCase()) || (c.orgName ?? "").toLowerCase().includes(q.toLowerCase())),
    [codes, pwFilter, statusFilter, validityFilter, q]
  );

  const total = filtered.length;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

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
        title="Kode Akses Aktivasi"
        count={total}
        breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Kode Akses PC" }]}
        subtitle="Generate dan kelola kode akses one-time untuk aktivasi Pengurus Cabang."
      />

      <ListControls
        pageSize={pageSize}
        onPageSize={(n) => { setPageSize(n); setPage(1); }}
        rangeText={`${start}–${end} dari ${total}`}
        right={
          <>
            <Button variant="outline" size="sm" className="h-10" onClick={exportCsv}>
              <Download className="mr-1.5 h-4 w-4" /> Export Kode
            </Button>
            <Button size="sm" className="h-10" onClick={() => setOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Generate Kode Akses
            </Button>
          </>
        }
      />

      <FilterBar>
        <SelectFilter value={pwFilter} onChange={setPwFilter} placeholder="Wilayah PW" options={[["all","Semua PW"], ...pws.map((p) => [p, p.replace("PWNU ","")] as [string,string])]} />
        <SelectFilter value={statusFilter} onChange={setStatusFilter} placeholder="Status kode" options={[["all","Semua Status"],["Unused","Belum Digunakan"],["Used","Sudah Digunakan"],["Expired","Kedaluwarsa"],["Disabled","Dinonaktifkan"]]} />
        <SelectFilter value={validityFilter} onChange={setValidityFilter} placeholder="Masa berlaku" options={[["all","Semua Periode"],["soon","Segera Kedaluwarsa (7 hari)"],["expired","Sudah Kedaluwarsa"]]} />
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari PC / kode akses"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 w-[260px] pl-9"
          />
        </div>
      </FilterBar>

      <DataTable>
        <THead>
          <tr>
            <TH>Kode Akses</TH>
            <TH>Nama PC</TH>
            <TH>Wilayah PW</TH>
            <TH>Status</TH>
            <TH>Generated At</TH>
            <TH>Expired At</TH>
            <TH>Used At</TH>
            <TH className="text-right pr-6">Aksi</TH>
          </tr>
        </THead>
        <tbody>
          {paged.map((c) => (
            <TR key={c.code}>
              <TD className="font-mono text-[12px] text-primary-dark">{c.code}</TD>
              <TD className="font-medium">{c.pcName}</TD>
              <TD className="text-[12px] text-muted-foreground">{c.pw.replace("PWNU ","")}</TD>
              <TD><AccessCodeStatusBadge status={c.status} /></TD>
              <TD className="text-[12px]">{formatDate(c.generatedAt)}</TD>
              <TD className="text-[12px]">{formatDate(c.expiredAt)}</TD>
              <TD className="text-[12px]">{c.usedAt ? formatDate(c.usedAt) : "—"}</TD>
              <TD className="text-right pr-6">
                <div className="flex justify-end gap-1">
                  <RowAction title="Salin kode" onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Kode disalin."); }}>
                    <Copy className="h-4 w-4" />
                  </RowAction>
                  {c.status === "Unused" && (
                    <RowAction title="Nonaktifkan" tone="danger" onClick={() => actions.disableAccessCode(c.code)}>
                      <Ban className="h-4 w-4" />
                    </RowAction>
                  )}
                  {(c.status === "Disabled" || c.status === "Expired") && (
                    <RowAction title="Regenerate" onClick={() => { actions.regenerateAccessCode(c.pcId); toast.success("Kode baru digenerate."); }}>
                      <RotateCcw className="h-4 w-4" />
                    </RowAction>
                  )}
                </div>
              </TD>
            </TR>
          ))}
          {paged.length === 0 && <EmptyRow colSpan={8}>Tidak ada kode akses sesuai filter.</EmptyRow>}
        </tbody>
      </DataTable>

      {total > pageSize && (
        <div className="flex items-center justify-end gap-2 px-6 pb-8 lg:px-8">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Sebelumnya</Button>
          <span className="text-[12px] text-muted-foreground">Halaman {page} dari {Math.ceil(total / pageSize)}</span>
          <Button variant="outline" size="sm" disabled={end >= total} onClick={() => setPage((p) => p + 1)}>Berikutnya</Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Generate Kode Akses</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Filter Wilayah PW</Label>
              <Select value={pwFilterModal} onValueChange={setPwFilterModal}>
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

function SelectFilter({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: [string, string][]; placeholder?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-[200px]"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
