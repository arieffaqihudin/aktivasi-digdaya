import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { slaBucket, daysSinceSubmit } from "@/utils/status";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Inbox, CheckCircle2, XCircle, AlertTriangle, FileDown } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KPI } from "@/components/dashboard/KPI";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/review/")({
  component: ReviewerRingkasan,
});

function ReviewerRingkasan() {
  const regs = useStore((s) => s.registrations);
  const sla = useStore((s) => s.sla);
  const batches = useStore((s) => s.batches);

  const today = new Date().toDateString();
  const pending = regs.filter((r) => r.status === "Pending");
  const approvedToday = regs.filter((r) => r.status === "Approved" && r.reviewedAt && new Date(r.reviewedAt).toDateString() === today);
  const rejectedToday = regs.filter((r) => r.status === "Rejected" && r.reviewedAt && new Date(r.reviewedAt).toDateString() === today);
  const lewatSLA = pending.filter((r) => slaBucket(r, sla.greenMaxDays, sla.yellowMaxDays) === "Lewat");
  const peruriToday = batches.filter((b) => b.date === new Date().toISOString().slice(0, 10)).reduce((a, b) => a + b.count, 0);

  // last 7 days
  const last7: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    last7.push({
      day: d.toLocaleDateString("id-ID", { weekday: "short" }),
      count: regs.filter((r) => new Date(r.submittedAt).toDateString() === key).length,
    });
  }

  const statusComp = [
    { name: "Pending", value: regs.filter((r) => r.status === "Pending").length },
    { name: "Approved", value: regs.filter((r) => r.status === "Approved").length },
    { name: "Rejected", value: regs.filter((r) => r.status === "Rejected").length },
  ];
  const statusColors = ["var(--color-warning)", "var(--color-success)", "var(--color-destructive)"];

  const tingkatComp = ["PC", "MWC", "Ranting", "Lembaga PC"].map((t) => ({
    tingkat: t,
    count: regs.filter((r) => r.tingkat === t).length,
  }));

  return (
    <div>
      <PageHeader
        title="Ringkasan Reviewer"
        subtitle="Status pendaftaran administrator Digdaya hari ini."
        action={
          <Link to="/dashboard/review/antrian">
            <Button size="sm">Lihat Antrian</Button>
          </Link>
        }
      />
      <div className="space-y-6 px-6 pb-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <KPI label="Pending Review" value={pending.length} icon={Inbox} tone="warning" />
          <KPI label="Disetujui Hari Ini" value={approvedToday.length} icon={CheckCircle2} tone="success" />
          <KPI label="Ditolak Hari Ini" value={rejectedToday.length} icon={XCircle} tone="destructive" />
          <KPI label="Melewati SLA" value={lewatSLA.length} icon={AlertTriangle} tone="destructive" />
          <KPI label="Export Peruri Hari Ini" value={peruriToday} icon={FileDown} tone="primary" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Submission 7 Hari Terakhir">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={last7}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Komposisi Status">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusComp} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                  {statusComp.map((_, i) => (
                    <Cell key={i} fill={statusColors[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card title="Komposisi Tingkat Kepengurusan">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tingkatComp} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} allowDecimals={false} />
              <YAxis type="category" dataKey="tingkat" stroke="var(--color-muted-foreground)" fontSize={11} width={90} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Pending Tertua">
          <div className="divide-y divide-border">
            {pending
              .sort((a, b) => +new Date(a.submittedAt) - +new Date(b.submittedAt))
              .slice(0, 5)
              .map((r) => (
                <Link key={r.ticketId} to="/dashboard/review/$ticketId" params={{ ticketId: r.ticketId }} className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-secondary/30">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-muted-foreground">{r.ticketId}</p>
                    <p className="truncate font-medium">{r.namaKepengurusan}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{Math.floor(daysSinceSubmit(r))} hari lalu</span>
                </Link>
              ))}
            {pending.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Tidak ada pendaftaran pending.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}
