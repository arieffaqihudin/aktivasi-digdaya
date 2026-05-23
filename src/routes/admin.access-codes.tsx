import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ListControls, FilterBar } from "@/components/dashboard/PageHeader";
import { DataTable, THead, TH, TR, TD, RowAction, EmptyRow } from "@/components/dashboard/DataTable";
import { actions, useStore, effectiveStatusOrg } from "@/lib/store";
import { masterPC, masterPW, type Tingkat } from "@/data/mockData";
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
  const [tingkatModal, setTingkatModal] = useState<Tingkat>("PC");
  const [pwFilterModal, setPwFilterModal] = useState<string>("all");
  const [picked, setPicked] = useState<string[]>([]);
  const [validDays, setValidDays] = useState(sla.defaultCodeValidDays);
  const [generating, setGenerating] = useState(false);

  const [tingkatFilter, setTingkatFilter] = useState("all");
  const [pwFilter, setPwFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [validityFilter, setValidityFilter] = useState("all");
  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const pws = Array.from(new Set(masterPC.map((p) => p.pw)));

  // Org options for the modal — hanya yang belum production
  const orgOptions = useMemo(() => {
    if (tingkatModal === "PW") {
      return masterPW
        .filter((p) => effectiveStatusOrg(p.id) !== "Production")
        .map((p) => ({ id: p.id, nama: p.nama, pw: p.nama }));
    }
    return masterPC
      .filter((p) => effectiveStatusOrg(p.id) !== "Production")
      .filter((p) => pwFilterModal === "all" || p.pw === pwFilterModal)
      .map((p) => ({ id: p.id, nama: p.nama, pw: p.pw }));
  }, [tingkatModal, pwFilterModal, codes]);

  const togglePick = (id: string) =>
    setPicked((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);

  const generate = async () => {
    if (picked.length === 0) { toast.error(`Pilih minimal 1 ${tingkatModal}.`); return; }
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 500));
    const created = actions.generateAccessCodes(picked, tingkatModal, validDays);
    setGenerating(false);
    toast.success(`${created.length} kode akses berhasil digenerate.`);
    setOpen(false); setPicked([]);
  };

  const filtered = useMemo(() => codes
    .filter((c) => tingkatFilter === "all" || c.tingkat === tingkatFilter)
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
    [codes, tingkatFilter, pwFilter, statusFilter, validityFilter, q]
  );

  const total = filtered.length;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const exportCsv = () => {
    const rows = [["Kode","Tingkat","Organisasi","Wilayah PW","Status","Generated","Expired","Used At","Ticket"]];
    filtered.forEach((c) => rows.push([c.code, c.tingkat, c.orgName ?? "", c.pw, c.status, formatDate(c.generatedAt), formatDate(c.expiredAt), c.usedAt ? formatDate(c.usedAt) : "", c.ticketId ?? ""]));
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
        breadcrumb={[{ label: "Admin", to: "/admin" }, { label: "Kode Akses" }]}
        subtitle="Generate dan kelola kode akses one-time untuk aktivasi PW/PC yang belum production."
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
        <SelectFilter value={tingkatFilter} onChange={setTingkatFilter} placeholder="Tingkat" options={[["all","Semua Tingkat"],["PW","PW"],["PC","PC"]]} />
        <SelectFilter value={pwFilter} onChange={setPwFilter} placeholder="Wilayah PW" options={[["all","Semua PW"], ...pws.map((p) => [p, p.replace("PWNU ","")] as [string,string])]} />
        <SelectFilter value={statusFilter} onChange={setStatusFilter} placeholder="Status" options={[["all","Semua Status"],["Unused","Belum Digunakan"],["Used","Sudah Digunakan"],["Expired","Kedaluwarsa"],["Disabled","Dinonaktifkan"]]} />
        <SelectFilter value={validityFilter} onChange={setValidityFilter} placeholder="Masa berlaku" options={[["all","Semua Periode"],["soon","Segera Kedaluwarsa (7 hari)"],["expired","Sudah Kedaluwarsa"]]} />
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari organisasi / kode"
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
            <TH>Tingkat</TH>
            <TH>Nama Organisasi</TH>
            <TH>Wilayah PW</TH>
            <TH>Status</TH>
            <TH>Generated</TH>
            <TH>Expired</TH>
            <TH>Used At</TH>
            <TH className="text-right pr-6">Aksi</TH>
          </tr>
        </THead>
        <tbody>
          {paged.map((c) => (
            <TR key={c.code}>
              <TD className="font-mono text-[12px] text-primary-dark">{c.code}</TD>
              <TD>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.tingkat === "PW" ? "bg-[oklch(0.93_0.06_240)] text-[oklch(0.34_0.10_240)]" : "bg-secondary text-foreground"}`}>
                  {c.tingkat}
                </span>
              </TD>
              <TD className="font-medium">{c.orgName}</TD>
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
                    <RowAction title="Regenerate" onClick={() => { actions.regenerateAccessCode(c.orgId, c.tingkat); toast.success("Kode baru digenerate."); }}>
                      <RotateCcw className="h-4 w-4" />
                    </RowAction>
                  )}
                </div>
              </TD>
            </TR>
          ))}
          {paged.length === 0 && <EmptyRow colSpan={9}>Tidak ada kode akses sesuai filter.</EmptyRow>}
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
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tingkat Organisasi</Label>
              <Select value={tingkatModal} onValueChange={(v) => { setTingkatModal(v as Tingkat); setPicked([]); }}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PW">PW (Pengurus Wilayah)</SelectItem>
                  <SelectItem value="PC">PC (Pengurus Cabang)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {tingkatModal === "PC" && (
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
            )}
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Pilih Organisasi ({picked.length} dipilih)</Label>
              <div className="mt-1.5 max-h-56 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                {orgOptions.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-secondary/50">
                    <Checkbox checked={picked.includes(p.id)} onCheckedChange={() => togglePick(p.id)} />
                    <span className="flex-1">{p.nama}</span>
                    <span className="text-xs text-muted-foreground">{p.pw.replace("PWNU ","")}</span>
                  </label>
                ))}
                {orgOptions.length === 0 && (
                  <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                    Tidak ada {tingkatModal} yang belum production.
                  </p>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Kode hanya bisa dibuat untuk organisasi yang belum production. Jika organisasi sudah memiliki kode aktif, kode lama akan dinonaktifkan.</p>
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
      <SelectTrigger className="h-10 w-[180px]"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
