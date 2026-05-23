import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KPI } from "@/components/dashboard/KPI";
import { useStore } from "@/lib/store";
import { Inbox, CheckCircle2, XCircle, Network, Building2, Layers, PlusCircle, ListChecks } from "lucide-react";

export const Route = createFileRoute("/pw/")({
  component: PwDashboard,
});

function PwDashboard() {
  const user = useStore((s) => s.user);
  const regs = useStore((s) => s.registrations.filter((r) => r.sumberPengajuan === "PW_DASHBOARD" && r.sourcePwId === user?.pwId));
  const stat = (s: string) => regs.filter((r) => r.status === s).length;
  const tipe = (t: string) => regs.filter((r) => r.tipeOrg === t && r.status === "Approved").length;

  return (
    <div>
      <PageHeader title={`Ringkasan ${user?.pwName ?? "PW"}`} subtitle="Pantauan pengajuan organisasi bawahan oleh PW Anda." />
      <div className="space-y-5 p-6">
        <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning-foreground">
          PW bertanggung jawab atas keabsahan data PC, MWC, dan Lembaga PW di wilayahnya.
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPI label="Total Pengajuan" value={regs.length} icon={Network} />
          <KPI label="Pending Review" value={stat("Pending")} icon={Inbox} tone="warning" />
          <KPI label="Disetujui" value={stat("Approved")} icon={CheckCircle2} tone="success" />
          <KPI label="Ditolak" value={stat("Rejected")} icon={XCircle} tone="destructive" />
          <KPI label="PC Terdaftar" value={tipe("PC")} icon={Building2} />
          <KPI label="Lembaga PW" value={tipe("Lembaga PW")} icon={Layers} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/pw/daftarkan" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-dark">
            <PlusCircle className="h-4 w-4" /> Daftarkan Organisasi Bawahan
          </Link>
          <Link to="/pw/status-pengajuan" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
            <ListChecks className="h-4 w-4" /> Lihat Status Pengajuan
          </Link>
        </div>
      </div>
    </div>
  );
}
