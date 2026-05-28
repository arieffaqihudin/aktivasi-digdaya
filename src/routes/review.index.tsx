import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KPI } from "@/components/dashboard/KPI";
import { useStore } from "@/lib/store";
import { Inbox, CheckCircle2, XCircle, Timer, FileDown, FileCheck, Network } from "lucide-react";
import { slaBucket } from "@/utils/status";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/review/")({
  component: ReviewSummary,
});

function ReviewSummary() {
  const regs = useStore((s) => s.registrations);
  const sla = useStore((s) => s.sla);

  const today = new Date().toDateString();
  const pending = regs.filter((r) => r.status === "Pending");
  const pendingA = pending.filter((r) => r.jalur === "A").length;
  const pendingB = pending.filter((r) => r.jalur === "B").length;
  const approvedToday = regs.filter((r) => r.status === "Approved" && r.reviewedAt && new Date(r.reviewedAt).toDateString() === today).length;
  const rejectedToday = regs.filter((r) => r.status === "PerluPerbaikan" || r.status === "RejectedFinal" && r.reviewedAt && new Date(r.reviewedAt).toDateString() === today).length;
  const overSla = pending.filter((r) => slaBucket(r, sla.greenMaxDays, sla.yellowMaxDays) === "Lewat").length;
  const inBatch = regs.filter((r) => r.peruriBatchId).length;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toDateString();
    return { d: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }), v: regs.filter((r) => new Date(r.submittedAt).toDateString() === key).length };
  });

  const tipeData = ["PC","MWC","Lembaga PC","Ranting"].map((t) => ({ name: t, value: regs.filter((r) => r.tipeOrg === t).length }));
  const COLORS = ["oklch(0.45 0.13 152)", "oklch(0.55 0.13 152)", "oklch(0.65 0.13 152)", "oklch(0.75 0.10 152)"];

  return (
    <div>
      <PageHeader title="Ringkasan Reviewer" subtitle="Beban kerja review pendaftaran Tim Digdaya." />
      <div className="space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPI label="Total Pending" value={pending.length} icon={Inbox} tone="warning" />
          <KPI label="Pending Kode Akses" value={pendingA} icon={FileCheck} />
          <KPI label="Pending Login Digdaya" value={pendingB} icon={Network} tone="info" />
          <KPI label="Approved Hari Ini" value={approvedToday} icon={CheckCircle2} tone="success" />
          <KPI label="Rejected Hari Ini" value={rejectedToday} icon={XCircle} tone="destructive" />
          <KPI label="Melewati SLA" value={overSla} icon={Timer} tone="destructive" />
          <KPI label="Masuk Batch Peruri" value={inBatch} icon={FileDown} />
          <Link to="/review/inbox" className="rounded-xl border border-primary/30 bg-primary/5 p-4 hover:bg-primary/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-dark">Aksi</p>
            <p className="mt-2 text-lg font-bold text-primary-dark">Buka Inbox</p>
            <p className="mt-1 text-xs text-muted-foreground">Review pengajuan baru.</p>
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="mb-3 text-sm font-semibold">Submission 7 Hari Terakhir</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={last7}>
                <XAxis dataKey="d" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip /><Bar dataKey="v" fill="oklch(0.45 0.13 152)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="mb-3 text-sm font-semibold">Komposisi Tipe Organisasi</p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={tipeData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {tipeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
