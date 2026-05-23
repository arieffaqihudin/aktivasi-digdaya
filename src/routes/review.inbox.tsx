import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, ListControls, FilterBar } from "@/components/dashboard/PageHeader";
import { DataTable, THead, TH, TR, TD, RowAction, EmptyRow } from "@/components/dashboard/DataTable";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { JalurBadge } from "@/components/JalurBadge";
import { SLABadge } from "@/components/SLABadge";
import { formatDate, slaBucket } from "@/utils/status";
import { useState, useMemo } from "react";
import { Eye, Search, FileDown, Download } from "lucide-react";

export const Route = createFileRoute("/review/inbox")({
  component: Inbox,
});

function Inbox() {
  const regs = useStore((s) => s.registrations);
  const sla = useStore((s) => s.sla);
  const [jalur, setJalur] = useState("all");
  const [tipe, setTipe] = useState("all");
  const [status, setStatus] = useState("Pending");
  const [pw, setPw] = useState("all");
  const [slaFilter, setSlaFilter] = useState("all");
  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const pws = Array.from(new Set(regs.map((r) => r.pw)));

  const filtered = useMemo(() => regs
    .filter((r) => jalur === "all" || r.jalur === jalur)
    .filter((r) => tipe === "all" || r.tipeOrg === tipe)
    .filter((r) => status === "all" || r.status === status)
    .filter((r) => pw === "all" || r.pw === pw)
    .filter((r) => slaFilter === "all" || slaBucket(r, sla.greenMaxDays, sla.yellowMaxDays) === slaFilter)
    .filter((r) => {
      if (!q) return true;
      const s = q.toLowerCase();
      return r.ticketId.toLowerCase().includes(s) || r.namaOrg.toLowerCase().includes(s) || r.namaAdmin.toLowerCase().includes(s);
    })
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()),
    [regs, jalur, tipe, status, pw, slaFilter, q, sla]
  );

  const total = filtered.length;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <PageHeader
        title="Inbox Pendaftaran"
        count={total}
        breadcrumb={[{ label: "Review", to: "/review" }, { label: "Inbox Pendaftaran" }]}
        subtitle="Semua pengajuan Jalur A dan Jalur B dalam satu inbox terpusat."
      />

      <ListControls
        pageSize={pageSize}
        onPageSize={(n) => { setPageSize(n); setPage(1); }}
        rangeText={`${start}–${end} dari ${total}`}
        right={
          <>
            <Button variant="outline" size="sm" className="h-10">
              <Download className="mr-1.5 h-4 w-4" /> Export Data
            </Button>
            <Link to="/review/peruri">
              <Button size="sm" className="h-10">
                <FileDown className="mr-1.5 h-4 w-4" /> Generate Batch Peruri
              </Button>
            </Link>
          </>
        }
      />

      <FilterBar>
        <SelectFilter value={jalur} onChange={setJalur} placeholder="Pilih Jalur" options={[["all","Semua Jalur"],["A","Jalur A"],["B","Jalur B"]]} />
        <SelectFilter value={tipe} onChange={setTipe} placeholder="Tipe Organisasi" options={[["all","Semua Tipe"],["PC","PC"],["MWC","MWC"],["Lembaga PC","Lembaga PC"],["Ranting","Ranting"]]} />
        <SelectFilter value={status} onChange={setStatus} placeholder="Status" options={[["all","Semua Status"],["Pending","Pending Review"],["Approved","Disetujui"],["Rejected","Ditolak"]]} />
        <SelectFilter value={pw} onChange={setPw} placeholder="Wilayah PW" options={[["all","Semua PW"], ...pws.map((p) => [p, p.replace("PWNU ","")] as [string,string])]} />
        <SelectFilter value={slaFilter} onChange={setSlaFilter} placeholder="SLA" options={[["all","Semua SLA"],["Aman","Aman"],["Mendekati","Mendekati"],["Lewat","Lewat SLA"]]} />
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari tiket / organisasi"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 w-[260px] pl-9"
          />
        </div>
      </FilterBar>

      <DataTable>
        <THead>
          <tr>
            <TH>Nomor Tiket</TH>
            <TH>Jalur</TH>
            <TH>Tipe</TH>
            <TH>Nama Organisasi</TH>
            <TH>Sumber Pendaftar</TH>
            <TH>Tanggal Pengajuan</TH>
            <TH>Status</TH>
            <TH>SLA</TH>
            <TH className="text-right pr-6">Aksi</TH>
          </tr>
        </THead>
        <tbody>
          {paged.map((r) => (
            <TR key={r.ticketId}>
              <TD className="font-mono text-[12px] text-primary-dark">{r.ticketId}</TD>
              <TD><JalurBadge jalur={r.jalur} /></TD>
              <TD className="text-[12px]">{r.tipeOrg}</TD>
              <TD>
                <div className="font-medium text-foreground">{r.namaOrg}</div>
                <div className="text-[11px] text-muted-foreground">{r.pw.replace("PWNU ","")}</div>
              </TD>
              <TD className="text-[12px] text-muted-foreground">{r.jalur === "A" ? "PC sendiri" : r.sourcePcName}</TD>
              <TD className="text-[12px] whitespace-nowrap">{formatDate(r.submittedAt)}</TD>
              <TD><StatusBadge status={r.status} /></TD>
              <TD><SLABadge bucket={slaBucket(r, sla.greenMaxDays, sla.yellowMaxDays)} /></TD>
              <TD className="text-right pr-6">
                <div className="flex justify-end gap-1">
                  <Link to="/review/inbox/$ticketId" params={{ ticketId: r.ticketId }}>
                    <RowAction title="Lihat detail" tone="primary"><Eye className="h-4 w-4" /></RowAction>
                  </Link>
                </div>
              </TD>
            </TR>
          ))}
          {paged.length === 0 && <EmptyRow colSpan={9}>Tidak ada pendaftaran sesuai filter.</EmptyRow>}
        </tbody>
      </DataTable>

      {total > pageSize && (
        <div className="flex items-center justify-end gap-2 px-6 pb-8 lg:px-8">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Sebelumnya</Button>
          <span className="text-[12px] text-muted-foreground">Halaman {page} dari {Math.ceil(total / pageSize)}</span>
          <Button variant="outline" size="sm" disabled={end >= total} onClick={() => setPage((p) => p + 1)}>Berikutnya</Button>
        </div>
      )}
    </div>
  );
}

function SelectFilter({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: [string, string][]; placeholder?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-[170px]"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
