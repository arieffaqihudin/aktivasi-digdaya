import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KPI } from "@/components/dashboard/KPI";
import { useStore } from "@/lib/store";
import { masterPC } from "@/data/mockData";
import { Building2, KeyRound, Users, CheckCircle2, FileCheck, Network, Send } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const regs = useStore((s) => s.registrations);
  const codes = useStore((s) => s.accessCodes);

  const totalPC = masterPC.length;
  const pcAktif = new Set(regs.filter((r) => r.jalur === "A" && r.status === "Approved").map((r) => r.namaOrg)).size;
  const jalurA = regs.filter((r) => r.jalur === "A").length;
  const jalurB = regs.filter((r) => r.jalur === "B").length;
  const onboarded = regs.filter((r) => r.status === "Approved" && r.jalur === "B").length;

  const adopsi = Object.entries(
    regs.reduce<Record<string, number>>((acc, r) => { acc[r.pw] = (acc[r.pw] ?? 0) + (r.status === "Approved" ? 1 : 0); return acc; }, {})
  ).map(([pw, v]) => ({ pw: pw.replace("PWNU ", ""), v }));

  const codeStatus = ["Unused","Used","Expired","Disabled"].map((s) => ({
    name: s, value: codes.filter((c) => c.status === s).length,
  }));
  const COLORS = ["oklch(0.45 0.13 152)", "oklch(0.60 0.15 152)", "oklch(0.70 0.02 160)", "oklch(0.55 0.18 25)"];

  return (
    <div>
      <PageHeader title="Overview Nasional" subtitle="Pantauan adopsi Portal Aktivasi Digdaya secara nasional." />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPI label="Total PC Target" value={totalPC} icon={Building2} />
          <KPI label="PC Sudah Aktif" value={pcAktif} icon={CheckCircle2} tone="success" />
          <KPI label="PC Belum Aktif" value={totalPC - pcAktif} icon={Users} tone="warning" />
          <KPI label="Total Kode Akses" value={codes.length} icon={KeyRound} />
          <KPI label="Kode Belum Digunakan" value={codes.filter((c) => c.status === "Unused").length} icon={KeyRound} tone="info" />
          <KPI label="Pengajuan Jalur A" value={jalurA} icon={FileCheck} />
          <KPI label="Pengajuan Jalur B" value={jalurB} icon={Network} tone="info" />
          <KPI label="MWC/Lembaga/Ranting Onboarded" value={onboarded} icon={Send} tone="success" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Adopsi per Wilayah PW (Approved)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={adopsi}>
                <XAxis dataKey="pw" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="v" fill="oklch(0.45 0.13 152)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Status Kode Akses">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={codeStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                  {codeStatus.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Manual</p>
            <p className="mt-2 text-2xl font-bold">10–20 organisasi/hari</p>
            <p className="mt-1 text-sm text-muted-foreground">Onboarding 7.000 MWC butuh lebih dari 1 tahun.</p>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-dark">Portal Aktivasi</p>
            <p className="mt-2 text-2xl font-bold text-primary-dark">150–200 organisasi/hari</p>
            <p className="mt-1 text-sm text-muted-foreground">7.000 MWC dapat onboarded &lt;2 bulan karena terdistribusi via PC.</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Aksi cepat</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/admin/access-codes" className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary-dark">Generate Kode Akses</Link>
            <Link to="/review/inbox" className="rounded-md border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-secondary">Lihat Inbox Pendaftaran</Link>
            <Link to="/review/peruri" className="rounded-md border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-secondary">Export Peruri</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="mb-3 text-sm font-semibold text-foreground">{title}</p>
      {children}
    </div>
  );
}
