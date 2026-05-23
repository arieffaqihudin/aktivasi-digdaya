import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { JalurBadge } from "@/components/JalurBadge";
import { SLABadge } from "@/components/SLABadge";
import { formatDate, slaBucket } from "@/utils/status";
import { useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";

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

  const pws = Array.from(new Set(regs.map((r) => r.pw)));

  const filtered = useMemo(() => regs
    .filter((r) => jalur === "all" || r.jalur === jalur)
    .filter((r) => tipe === "all" || r.tipeOrg === tipe)
    .filter((r) => status === "all" || r.status === status)
    .filter((r) => pw === "all" || r.pw === pw)
    .filter((r) => {
      if (slaFilter === "all") return true;
      return slaBucket(r, sla.greenMaxDays, sla.yellowMaxDays) === slaFilter;
    })
    .filter((r) => {
      if (!q) return true;
      const s = q.toLowerCase();
      return r.ticketId.toLowerCase().includes(s) || r.namaOrg.toLowerCase().includes(s) || r.namaAdmin.toLowerCase().includes(s);
    })
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()),
    [regs, jalur, tipe, status, pw, slaFilter, q, sla]
  );

  return (
    <div>
      <PageHeader title="Inbox Pendaftaran" subtitle="Semua pengajuan Jalur A dan Jalur B dalam satu inbox terpusat." />
      <div className="space-y-4 p-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <Input placeholder="Cari tiket / organisasi / admin…" value={q} onChange={(e) => setQ(e.target.value)} className="lg:col-span-2" />
            <SelectFilter value={jalur} onChange={setJalur} options={[["all","Semua Jalur"],["A","Jalur A"],["B","Jalur B"]]} />
            <SelectFilter value={tipe} onChange={setTipe} options={[["all","Semua Tipe"],["PC","PC"],["MWC","MWC"],["Lembaga PC","Lembaga PC"],["Ranting","Ranting"]]} />
            <SelectFilter value={status} onChange={setStatus} options={[["all","Semua Status"],["Pending","Pending"],["Approved","Approved"],["Rejected","Rejected"]]} />
            <SelectFilter value={pw} onChange={setPw} options={[["all","Semua PW"], ...pws.map((p) => [p, p.replace("PWNU ","")] as [string,string])]} />
          </div>
          <div className="mt-3 flex gap-2 text-xs">
            <span className="text-muted-foreground">Filter SLA:</span>
            {["all","Aman","Mendekati","Lewat"].map((s) => (
              <button key={s} onClick={() => setSlaFilter(s)}
                className={`rounded-md px-2 py-1 font-medium ${slaFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {s === "all" ? "Semua" : s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Tiket</th>
                <th className="px-4 py-3">Jalur</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Nama Organisasi</th>
                <th className="px-4 py-3">Sumber Pendaftar</th>
                <th className="px-4 py-3">PW</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Submit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">SLA</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.ticketId} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs">{r.ticketId}</td>
                  <td className="px-4 py-3"><JalurBadge jalur={r.jalur} /></td>
                  <td className="px-4 py-3 text-xs">{r.tipeOrg}</td>
                  <td className="px-4 py-3 font-medium">{r.namaOrg}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.jalur === "A" ? "PC sendiri" : r.sourcePcName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.pw.replace("PWNU ","")}</td>
                  <td className="px-4 py-3 text-xs">{r.namaAdmin}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{formatDate(r.submittedAt)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3"><SLABadge bucket={slaBucket(r, sla.greenMaxDays, sla.yellowMaxDays)} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/review/inbox/$ticketId" params={{ ticketId: r.ticketId }} className="inline-flex items-center text-xs font-medium text-primary-dark hover:underline">
                      Review <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-12 text-center text-sm text-muted-foreground">Tidak ada pendaftaran sesuai filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SelectFilter({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
