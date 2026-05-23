import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KPI } from "@/components/dashboard/KPI";
import { slaBucket } from "@/utils/status";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart, Legend } from "recharts";
import { CheckCircle2, XCircle, Inbox, AlertTriangle, Users, Gauge } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const regs = useStore((s) => s.registrations);
  const sla = useStore((s) => s.sla);

  const total = regs.length;
  const approved = regs.filter((r) => r.status === "Approved").length;
  const rejected = regs.filter((r) => r.status === "Rejected").length;
  const pending = regs.filter((r) => r.status === "Pending").length;
  const lewat = regs.filter((r) => r.status === "Pending" && slaBucket(r, sla.greenMaxDays, sla.yellowMaxDays) === "Lewat").length;
  const today = new Date().toDateString();
  const todayApproved = regs.filter((r) => r.status === "Approved" && r.reviewedAt && new Date(r.reviewedAt).toDateString() === today).length;

  const byPW = Array.from(new Set(regs.map((r) => r.pw))).map((pw) => ({
    pw: pw.replace("PWNU ", ""),
    total: regs.filter((r) => r.pw === pw).length,
  }));

  const tingkatStatus = ["PC", "MWC", "Ranting", "Lembaga PC"].map((t) => {
    const arr = regs.filter((r) => r.tingkat === t);
    return { tingkat: t, Approved: arr.filter((r) => r.status === "Approved").length, Pending: arr.filter((r) => r.status === "Pending").length, Rejected: arr.filter((r) => r.status === "Rejected").length };
  });

  const trend: { day: string; submit: number; approved: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toDateString();
    trend.push({
      day: d.toLocaleDateString("id-ID", { weekday: "short" }),
      submit: regs.filter((r) => new Date(r.submittedAt).toDateString() === key).length,
      approved: regs.filter((r) => r.reviewedAt && r.status === "Approved" && new Date(r.reviewedAt).toDateString() === key).length,
    });
  }

  return (
    <div>
      <PageHeader title="Overview Nasional" subtitle="Ringkasan onboarding administrator Digdaya di seluruh wilayah." />
      <div className="space-y-6 px-6 pb-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <KPI label="Total Pendaftaran" value={total} icon={Users} tone="primary" />
          <KPI label="Disetujui" value={approved} icon={CheckCircle2} tone="success" />
          <KPI label="Ditolak" value={rejected} icon={XCircle} tone="destructive" />
          <KPI label="Pending" value={pending} icon={Inbox} tone="warning" />
          <KPI label="Melewati SLA" value={lewat} icon={AlertTriangle} tone="destructive" />
          <KPI label="Onboarded Hari Ini" value={todayApproved} icon={Gauge} tone="info" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Onboarding per Wilayah PW">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byPW}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="pw" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Status per Tingkat Kepengurusan">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={tingkatStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="tingkat" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Approved" stackId="a" fill="var(--color-success)" />
                <Bar dataKey="Pending" stackId="a" fill="var(--color-warning)" />
                <Bar dataKey="Rejected" stackId="a" fill="var(--color-destructive)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card title="Trend Submit vs Approved (7 hari)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="submit" stroke="var(--color-primary)" strokeWidth={2} />
              <Line type="monotone" dataKey="approved" stroke="var(--color-success)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <ComparisonCard title="Manual" value="10–20" sub="organisasi/hari" tone="bg-destructive/5 border-destructive/20" valueTone="text-destructive" note="Tim Digdaya input data satu per satu." />
          <ComparisonCard title="Portal Digdaya" value="150–200" sub="organisasi/hari (target)" tone="bg-success/5 border-success/30" valueTone="text-success" note="Self-service oleh kepengurusan." />
          <ComparisonCard title="Estimasi 7.000 MWC" value="<2 bulan" sub="pada kapasitas 150/hari" tone="bg-primary/5 border-primary/30" valueTone="text-primary-dark" note="Manual: >1 tahun. Portal mempercepat 6×+." />
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-5"><h2 className="mb-4 text-sm font-semibold">{title}</h2>{children}</div>;
}
function ComparisonCard({ title, value, sub, tone, valueTone, note }: { title: string; value: string; sub: string; tone: string; valueTone: string; note: string }) {
  return (
    <div className={`rounded-xl border p-5 ${tone}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${valueTone}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
      <p className="mt-3 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
