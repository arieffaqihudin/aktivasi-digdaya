import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { DataTable, THead, TH, TR, TD, EmptyRow } from "@/components/dashboard/DataTable";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { SumberPengajuanBadge, SumberSuratBadge } from "@/components/SumberBadge";
import { formatDate } from "@/utils/status";
import { useState, useMemo } from "react";
import { Eye, Search, Download } from "lucide-react";

export const Route = createFileRoute("/ops/activation/submissions")({
  component: Submissions,
});

function Submissions() {
  const regs = useStore((s) => s.registrations);
  const navigate = useNavigate();
  const goDetail = (ticketId: string) => navigate({ to: "/ops/activation/submissions/$ticketId", params: { ticketId } });
  const [sumber, setSumber] = useState("all");
  const [pw, setPw] = useState("all");
  const [q, setQ] = useState("");

  const pws = Array.from(new Set(regs.map((r) => r.pw)));

  const filtered = useMemo(() => regs
    .filter((r) => {
      if (sumber === "all") return true;
      if (sumber === "PUBLIC") return r.sumberPengajuan === "PUBLIC";
      if (sumber === "LOGIN") return r.sumberPengajuan === "PW_DASHBOARD" || r.sumberPengajuan === "PC_DASHBOARD";
      return true;
    })
    .filter((r) => status === "all" || r.status === status)
    .filter((r) => pw === "all" || r.pw === pw)
    .filter((r) => !q || r.ticketId.toLowerCase().includes(q.toLowerCase()) || r.namaOrg.toLowerCase().includes(q.toLowerCase()) || r.namaAdmin.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()),
    [regs, sumber, status, pw, q]
  );

  return (
    <div>
      <OpsPageHeader
        title="Pengajuan Aktivasi"
        subtitle="Semua pengajuan aktivasi dari portal publik dan dashboard PW/PC."
        breadcrumb={[{ label: "Aktivasi Digdaya", to: "/ops/activation" }, { label: "Pengajuan Aktivasi" }]}
      />
      <OpsPageBody>
        <OpsCard
          title="Daftar Pengajuan"
          description={`Total ${filtered.length} pengajuan ditemukan.`}
          action={<Button size="sm" variant="outline"><Download className="mr-1.5 h-4 w-4" /> Export Data</Button>}
        >
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:flex-1 sm:min-w-[240px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari nomor tiket / organisasi / administrator" value={q} onChange={(e) => setQ(e.target.value)} className="h-10 w-full pl-9" />
            </div>
            <SelectFilter value={sumber} onChange={setSumber} placeholder="Sumber Pengajuan" options={[["all","Semua Sumber"],["LOGIN","Login Digdaya"],["PUBLIC","Kode Akses"]]} />
            <SelectFilter value={status} onChange={setStatus} placeholder="Status" options={[["all","Semua Status"],["Pending","Pending Review"],["PerluPerbaikan","Perlu Perbaikan"],["Approved","Disetujui"],["RejectedFinal","Ditolak Final"]]} />
            
            <SelectFilter value={pw} onChange={setPw} placeholder="Wilayah" options={[["all","Semua PW"], ...pws.map((p) => [p, p.replace("PWNU ","")] as [string,string])]} />
          </div>
        </OpsCard>

        <DataTable className="mx-0">
          <THead>
            <tr>
              <TH>Nomor Tiket</TH>
              <TH>Sumber Pengajuan</TH>
              <TH>Organisasi</TH>
              <TH>Wilayah</TH>
              <TH>Administrator</TH>
              <TH>Surat Tugas</TH>
              <TH>Status</TH>
              
              <TH className="text-right pr-6">Aksi</TH>
            </tr>
          </THead>
          <tbody>
            {filtered.map((r) => (
              <TR key={r.ticketId}>
                <TD className="font-mono text-[12px] text-primary-dark">{r.ticketId}</TD>
                <TD><SumberPengajuanBadge sumber={r.sumberPengajuan} /></TD>
                <TD>
                  <div className="text-[12.5px] font-medium">{r.tipeOrg} · {r.namaOrg}</div>
                  <div className="text-[11px] text-muted-foreground">{formatDate(r.submittedAt)}</div>
                </TD>
                <TD className="text-[12px] text-muted-foreground">{r.pw.replace("PWNU ","")}</TD>
                <TD className="text-[12px]">{r.namaAdmin}</TD>
                <TD><SumberSuratBadge sumber={r.sumberSuratTugas} /></TD>
                <TD><StatusBadge status={r.status} /></TD>
                
                <TD className="text-right pr-6">
                  <Link
                    to="/ops/activation/submissions/$ticketId"
                    params={{ ticketId: r.ticketId }}
                    title="Lihat detail"
                    aria-label={`Lihat detail ${r.ticketId}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-primary hover:bg-accent transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </TD>
              </TR>
            ))}
            {filtered.length === 0 && <EmptyRow colSpan={8}>Tidak ada pengajuan sesuai filter.</EmptyRow>}
          </tbody>
        </DataTable>
      </OpsPageBody>
    </div>
  );
}

function SelectFilter({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: [string, string][]; placeholder?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full sm:w-[160px]"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
