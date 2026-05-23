import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, ListControls, FilterBar } from "@/components/dashboard/PageHeader";
import { DataTable, THead, TH, TR, TD, RowAction, EmptyRow } from "@/components/dashboard/DataTable";
import { useStore } from "@/lib/store";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/utils/status";
import { useMemo, useState } from "react";
import { Eye, Search, PlusCircle, RotateCcw, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/pc/status-pengajuan")({
  component: StatusPengajuan,
});

function StatusPengajuan() {
  const user = useStore((s) => s.user);
  const regs = useStore((s) => s.registrations.filter((r) => r.jalur === "B" && r.sourcePcId === user?.pcId));

  const [statusFilter, setStatusFilter] = useState("all");
  const [tipeFilter, setTipeFilter] = useState("all");
  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() =>
    regs
      .filter((r) => statusFilter === "all" || r.status === statusFilter)
      .filter((r) => tipeFilter === "all" || r.tipeOrg === tipeFilter)
      .filter((r) => !q || r.ticketId.toLowerCase().includes(q.toLowerCase()) || r.namaOrg.toLowerCase().includes(q.toLowerCase())),
    [regs, statusFilter, tipeFilter, q]
  );

  const total = filtered.length;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <PageHeader
        title="Status Pengajuan"
        count={total}
        breadcrumb={[{ label: "PC", to: "/pc" }, { label: "Aktivasi Organisasi" }, { label: "Status Pengajuan" }]}
        subtitle="Semua pengajuan Jalur B dari PC Anda."
      />

      <ListControls
        pageSize={pageSize}
        onPageSize={(n) => { setPageSize(n); setPage(1); }}
        rangeText={`${start}–${end} dari ${total}`}
        right={
          <Link to="/pc/daftarkan">
            <Button size="sm" className="h-10"><PlusCircle className="mr-1.5 h-4 w-4" /> Daftarkan Organisasi</Button>
          </Link>
        }
      />

      <FilterBar>
        <SelectFilter value={tipeFilter} onChange={setTipeFilter} placeholder="Tipe Organisasi" options={[["all","Semua Tipe"],["MWC","MWC"],["Lembaga PC","Lembaga PC"],["Ranting","Ranting"]]} />
        <SelectFilter value={statusFilter} onChange={setStatusFilter} placeholder="Status" options={[["all","Semua Status"],["Pending","Pending Review"],["PerluPerbaikan","Perlu Perbaikan"],["Approved","Disetujui"],["RejectedFinal","Ditolak Final"]]} />
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
            <TH>Tipe</TH>
            <TH>Nama Organisasi</TH>
            <TH>Admin</TH>
            <TH>Tanggal Pengajuan</TH>
            <TH>Status</TH>
            <TH>Catatan</TH>
            <TH className="text-right pr-6">Aksi</TH>
          </tr>
        </THead>
        <tbody>
          {paged.map((r) => (
            <TR key={r.ticketId}>
              <TD className="font-mono text-[12px] text-primary-dark">{r.ticketId}</TD>
              <TD className="text-[12px]">{r.tipeOrg}</TD>
              <TD className="font-medium">{r.namaOrg}</TD>
              <TD className="text-[12px]">{r.namaAdmin}</TD>
              <TD className="text-[12px]">{formatDate(r.submittedAt)}</TD>
              <TD>
                <div className="flex flex-col gap-1">
                  <StatusBadge status={r.status} />
                  {r.status === "Approved" && (
                    <span className="text-[10px] font-medium text-muted-foreground">Admin menunggu aktivasi</span>
                  )}
                </div>
              </TD>
              <TD className="max-w-xs text-[12px] text-muted-foreground">{r.rejectReason ?? "—"}</TD>
              <TD className="text-right pr-6">
                <div className="flex justify-end gap-1">
                  {r.status === "PerluPerbaikan" || r.status === "RejectedFinal" ? (
                    <Link to="/pc/daftarkan">
                      <RowAction title="Ajukan ulang" tone="primary"><RotateCcw className="h-4 w-4" /></RowAction>
                    </Link>
                  ) : (
                    <Link to="/status/$ticketId" params={{ ticketId: r.ticketId }}>
                      <RowAction title="Lihat detail" tone="primary"><Eye className="h-4 w-4" /></RowAction>
                    </Link>
                  )}
                </div>
              </TD>
            </TR>
          ))}
          {paged.length === 0 && <EmptyRow colSpan={8}>Belum ada pengajuan. Mulai dengan Daftarkan Organisasi Bawahan.</EmptyRow>}
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
      <SelectTrigger className="h-10 w-[200px]"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
