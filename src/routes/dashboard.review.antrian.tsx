import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { SLABadge } from "@/components/SLABadge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { slaBucket, formatDate, formatRelativeDays } from "@/utils/status";
import { Inbox, Search, Eye } from "lucide-react";

export const Route = createFileRoute("/dashboard/review/antrian")({
  component: Antrian,
});

function Antrian() {
  const regs = useStore((s) => s.registrations);
  const sla = useStore((s) => s.sla);
  const [q, setQ] = useState("");
  const [tingkat, setTingkat] = useState("all");
  const [status, setStatus] = useState("all");
  const [pw, setPw] = useState("all");
  const [slaF, setSlaF] = useState("all");

  const pws = useMemo(() => Array.from(new Set(regs.map((r) => r.pw))).sort(), [regs]);

  const filtered = useMemo(() => {
    return regs
      .filter((r) => {
        if (tingkat !== "all" && r.tingkat !== tingkat) return false;
        if (status !== "all" && r.status !== status) return false;
        if (pw !== "all" && r.pw !== pw) return false;
        if (slaF !== "all" && slaBucket(r, sla.greenMaxDays, sla.yellowMaxDays) !== slaF) return false;
        if (q) {
          const s = q.toLowerCase();
          if (!r.ticketId.toLowerCase().includes(s) && !r.namaKepengurusan.toLowerCase().includes(s) && !r.namaAdmin.toLowerCase().includes(s)) return false;
        }
        return true;
      })
      .sort((a, b) => +new Date(a.submittedAt) - +new Date(b.submittedAt));
  }, [regs, q, tingkat, status, pw, slaF, sla]);

  return (
    <div>
      <PageHeader title="Antrian Pendaftaran" subtitle={`${filtered.length} pendaftaran ditampilkan, urut dari yang paling lama.`} />
      <div className="space-y-4 px-6 pb-10">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="grid gap-3 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari tiket, kepengurusan, atau admin…" className="pl-9" />
            </div>
            <FilterSelect value={tingkat} onChange={setTingkat} options={[["all", "Semua Tingkat"], ["PC", "PC"], ["MWC", "MWC"], ["Ranting", "Ranting"], ["Lembaga PC", "Lembaga PC"]]} />
            <FilterSelect value={status} onChange={setStatus} options={[["all", "Semua Status"], ["Pending", "Pending"], ["Approved", "Approved"], ["Rejected", "Rejected"]]} />
            <FilterSelect value={pw} onChange={setPw} options={[["all", "Semua PW"], ...pws.map((p) => [p, p] as [string, string])]} />
          </div>
          <div className="mt-3 max-w-xs">
            <FilterSelect value={slaF} onChange={setSlaF} options={[["all", "Semua SLA"], ["Aman", "Aman"], ["Mendekati", "Mendekati"], ["Lewat", "Lewat SLA"]]} />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Tiket</th>
                  <th className="px-4 py-3 text-left">Kepengurusan</th>
                  <th className="px-4 py-3 text-left">Tingkat</th>
                  <th className="px-4 py-3 text-left">PW</th>
                  <th className="px-4 py-3 text-left">Administrator</th>
                  <th className="px-4 py-3 text-left">Submit</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">SLA</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.ticketId} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono text-xs text-primary-dark">{r.ticketId}</td>
                    <td className="px-4 py-3 font-medium">{r.namaKepengurusan}</td>
                    <td className="px-4 py-3"><span className="rounded bg-secondary px-1.5 py-0.5 text-[11px] font-medium">{r.tingkat}</span></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.pw}</td>
                    <td className="px-4 py-3">{r.namaAdmin}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(r.submittedAt)}<br /><span className="text-[10px]">{formatRelativeDays(r)} lalu</span></td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3"><SLABadge bucket={slaBucket(r, sla.greenMaxDays, sla.yellowMaxDays)} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link to="/dashboard/review/$ticketId" params={{ ticketId: r.ticketId }}>
                        <Button size="sm" variant="outline"><Eye className="mr-1 h-3.5 w-3.5" /> Detail</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-12 text-center"><Inbox className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-2 text-sm text-muted-foreground">Tidak ada pendaftaran yang cocok dengan filter saat ini.</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>{options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
    </Select>
  );
}
