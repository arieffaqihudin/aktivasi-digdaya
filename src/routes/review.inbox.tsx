import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, ListControls, FilterBar } from "@/components/dashboard/PageHeader";
import { DataTable, THead, TH, TR, TD, RowAction, EmptyRow } from "@/components/dashboard/DataTable";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { SumberPengajuanBadge, SumberSuratBadge } from "@/components/SumberBadge";
import { formatDate } from "@/utils/status";
import { useState, useMemo } from "react";
import { Eye, Search, FileDown, Download } from "lucide-react";

export const Route = createFileRoute("/review/inbox")({
  component: Inbox,
});

function Inbox() {
  const regs = useStore((s) => s.registrations);
  const [sumber, setSumber] = useState("all");
  const [tingkat, setTingkat] = useState("all");
  const [sumberSurat, setSumberSurat] = useState("all");
  const [tipe, setTipe] = useState("all");
  const [status, setStatus] = useState("Pending");
  const [pw, setPw] = useState("all");
  
  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const pws = Array.from(new Set(regs.map((r) => r.pw)));

  const filtered = useMemo(() => regs
    .filter((r) => {
      if (sumber === "all") return true;
      if (sumber === "PUBLIC") return r.sumberPengajuan === "PUBLIC";
      if (sumber === "LOGIN") return r.sumberPengajuan === "PW_DASHBOARD" || r.sumberPengajuan === "PC_DASHBOARD";
      return true;
    })
    .filter((r) => tingkat === "all" || r.tingkatPendaftar === tingkat)
    .filter((r) => sumberSurat === "all" || r.sumberSuratTugas === sumberSurat)
    .filter((r) => tipe === "all" || r.tipeOrg === tipe)
    .filter((r) => status === "all" || r.status === status)
    .filter((r) => pw === "all" || r.pw === pw)
    .filter((r) => {
      if (!q) return true;
      const s = q.toLowerCase();
      return r.ticketId.toLowerCase().includes(s) || r.namaOrg.toLowerCase().includes(s) || r.namaAdmin.toLowerCase().includes(s);
    })
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()),
    [regs, sumber, tingkat, sumberSurat, tipe, status, pw, q]
  );

  const total = filtered.length;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const pendaftarLabel = (r: typeof regs[number]) => {
    if (r.sumberPengajuan === "PUBLIC") return "Aktivasi Publik";
    if (r.sumberPengajuan === "PW_DASHBOARD") return r.sourcePwName ?? "PW";
    return r.sourcePcName ?? "PC";
  };

  return (
    <div>
      <PageHeader
        title="Inbox Pendaftaran"
        count={total}
        breadcrumb={[{ label: "Review", to: "/review" }, { label: "Inbox Pendaftaran" }]}
        subtitle="Semua pengajuan dari portal publik, dashboard PW, dan dashboard PC."
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
        <SelectFilter value={sumber} onChange={setSumber} placeholder="Sumber Pengajuan" options={[["all","Semua Sumber"],["LOGIN","Login Digdaya"],["PUBLIC","Kode Akses"]]} />
        <SelectFilter value={tingkat} onChange={setTingkat} placeholder="Tingkat Pendaftar" options={[["all","Semua Tingkat"],["PW","PW"],["PC","PC"]]} />
        <SelectFilter value={sumberSurat} onChange={setSumberSurat} placeholder="Sumber Surat Tugas" options={[["all","Semua Surat"],["DIGDAYA_PERSURATAN","Dari Sistem"],["MANUAL_UPLOAD","Upload Manual"]]} />
        <SelectFilter value={tipe} onChange={setTipe} placeholder="Tipe Organisasi" options={[["all","Semua Tipe"],["PW","PW"],["PC","PC"],["MWC","MWC"],["Lembaga PW","Lembaga PW"],["Lembaga PC","Lembaga PC"],["Ranting","Ranting"]]} />
        <SelectFilter value={status} onChange={setStatus} placeholder="Status" options={[["all","Semua Status"],["Pending","Pending Review"],["PerluPerbaikan","Perlu Perbaikan"],["Approved","Disetujui"],["RejectedFinal","Ditolak Final"]]} />
        <SelectFilter value={pw} onChange={setPw} placeholder="Wilayah PW" options={[["all","Semua PW"], ...pws.map((p) => [p, p.replace("PWNU ","")] as [string,string])]} />
        
        <div className="relative ml-auto w-full sm:w-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari tiket / organisasi"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 w-full sm:w-[240px] pl-9"
          />
        </div>
      </FilterBar>

      <DataTable>
        <THead>
          <tr>
            <TH>Nomor Tiket</TH>
            <TH>Sumber Pengajuan</TH>
            <TH>Pendaftar</TH>
            <TH>Tipe / Organisasi</TH>
            <TH>Admin</TH>
            <TH>Surat Tugas</TH>
            <TH>Tanggal</TH>
            <TH>Status</TH>
            
            <TH className="text-right pr-6">Aksi</TH>
          </tr>
        </THead>
        <tbody>
          {paged.map((r) => (
            <TR key={r.ticketId}>
              <TD className="font-mono text-[12px] text-primary-dark">{r.ticketId}</TD>
              <TD><SumberPengajuanBadge sumber={r.sumberPengajuan} /></TD>
              <TD className="text-[12px] text-muted-foreground">{pendaftarLabel(r)}</TD>
              <TD>
                <div className="text-[12px] font-medium text-foreground">{r.tipeOrg} · {r.namaOrg}</div>
                <div className="text-[11px] text-muted-foreground">{r.pw.replace("PWNU ","")}</div>
              </TD>
              <TD className="text-[12px]">{r.namaAdmin}</TD>
              <TD><SumberSuratBadge sumber={r.sumberSuratTugas} /></TD>
              <TD className="text-[12px] whitespace-nowrap">{formatDate(r.submittedAt)}</TD>
              <TD><StatusBadge status={r.status} /></TD>
              
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
      <SelectTrigger className="h-10 w-full sm:w-[170px]"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
