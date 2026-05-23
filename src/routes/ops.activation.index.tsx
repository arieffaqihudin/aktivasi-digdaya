import { createFileRoute, Link } from "@tanstack/react-router";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { useStore, effectiveStatusOrg } from "@/lib/store";
import { masterPC, masterPW } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { KeyRound, FileDown, Inbox, ArrowRight, ClipboardList, AlertTriangle, CheckCircle2, Clock, Building2 } from "lucide-react";
import { formatDate, slaBucket } from "@/utils/status";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/ops/activation/")({
  component: ActivationOverview,
});

function ActivationOverview() {
  const regs = useStore((s) => s.registrations);
  const codes = useStore((s) => s.accessCodes);
  const sla = useStore((s) => s.sla);

  const allOrgs = [...masterPC, ...masterPW];
  const belumProduction = allOrgs.filter((o) => effectiveStatusOrg(o.id) !== "Production").length;
  const production = allOrgs.length - belumProduction;
  const pending = regs.filter((r) => r.status === "Pending").length;
  const perluPerbaikan = regs.filter((r) => r.status === "PerluPerbaikan").length;
  const lewatSla = regs.filter((r) => r.status === "Pending" && slaBucket(r, sla.greenMaxDays, sla.yellowMaxDays) === "Lewat").length;

  const recent = [...regs]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  const codesAktif = codes.filter((c) => c.status === "Unused").slice(0, 5);

  return (
    <div>
      <OpsPageHeader
        title="Overview Aktivasi Digdaya"
        subtitle="Pantau proses aktivasi PW/PC dan onboarding organisasi melalui Portal Aktivasi Digdaya."
        breadcrumb={[{ label: "Aktivasi Digdaya" }, { label: "Overview" }]}
      />
      <OpsPageBody>
        {/* KPI grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Kpi label="Total Kode Akses" value={codes.length} icon={KeyRound} />
          <Kpi label="Belum Production" value={belumProduction} icon={Building2} tone="info" />
          <Kpi label="Pending Aktivasi" value={pending} icon={Clock} tone="warning" />
          <Kpi label="Perlu Perbaikan" value={perluPerbaikan} icon={AlertTriangle} tone="warning" />
          <Kpi label="Sudah Production" value={production} icon={CheckCircle2} tone="success" />
          <Kpi label="Melewati SLA" value={lewatSla} icon={ClipboardList} tone="destructive" />
        </div>

        {/* Quick actions */}
        <OpsCard title="Aksi Cepat" description="Pintasan operasional yang sering digunakan.">
          <div className="flex flex-wrap gap-2">
            <Link to="/ops/activation/access-codes"><Button size="sm"><KeyRound className="mr-1.5 h-4 w-4" /> Generate Kode Akses</Button></Link>
            <Link to="/ops/activation/submissions"><Button size="sm" variant="outline"><Inbox className="mr-1.5 h-4 w-4" /> Lihat Pengajuan Aktivasi</Button></Link>
            <Link to="/ops/activation/peruri-export"><Button size="sm" variant="outline"><FileDown className="mr-1.5 h-4 w-4" /> Export Peruri</Button></Link>
          </div>
        </OpsCard>

        <div className="grid gap-5 lg:grid-cols-2">
          <OpsCard title="Pengajuan Terbaru" action={<Link to="/ops/activation/submissions" className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline">Lihat semua <ArrowRight className="h-3 w-3" /></Link>}>
            <ul className="divide-y divide-border">
              {recent.length === 0 && <li className="py-4 text-center text-[13px] text-muted-foreground">Belum ada pengajuan.</li>}
              {recent.map((r) => (
                <li key={r.ticketId} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-foreground">{r.namaOrg}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{r.ticketId} · {formatDate(r.submittedAt)}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          </OpsCard>

          <OpsCard title="Kode Akses Aktif" action={<Link to="/ops/activation/access-codes" className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline">Kelola <ArrowRight className="h-3 w-3" /></Link>}>
            <ul className="divide-y divide-border">
              {codesAktif.length === 0 && <li className="py-4 text-center text-[13px] text-muted-foreground">Belum ada kode aktif.</li>}
              {codesAktif.map((c) => (
                <li key={c.code} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="font-mono text-[12.5px] font-medium text-primary-dark">{c.code}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{c.orgName ?? c.batchName ?? "—"} · {c.tingkat}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground">exp {formatDate(c.expiredAt)}</span>
                </li>
              ))}
            </ul>
          </OpsCard>
        </div>
      </OpsPageBody>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, tone = "primary" }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; tone?: "primary" | "success" | "warning" | "info" | "destructive" }) {
  const toneCls: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    info: "bg-info/15 text-info",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <span className={"inline-flex h-8 w-8 items-center justify-center rounded-md " + toneCls[tone]}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
