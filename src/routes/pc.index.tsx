import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore, effectiveStatusOrg } from "@/lib/store";
import { StatusBadge } from "@/components/StatusBadge";
import { PlusCircle, Upload, ListChecks, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/pc/")({
  component: PcDashboard,
});

function PcDashboard() {
  const registrations = useStore((s) => s.registrations);

  const regs = useMemo(
    () => registrations.filter((r) => r.sumberPengajuan === "PC_DASHBOARD"),
    [registrations],
  );

  const rantingRegs = regs.filter((r) => r.tipeOrg === "Ranting");
  const pendingReview = regs.filter((r) => r.status === "Pending").length;
  const needRevision = regs.filter((r) => r.status === "PerluPerbaikan").length;
  const totalRanting = rantingRegs.length;
  const production = regs.filter(
    (r) => r.selectedOrgId && effectiveStatusOrg(r.selectedOrgId) === "Production",
  ).length;
  const belumProduction = regs.length - production;

  const now = new Date();
  const thisMonth = regs.filter((r) => {
    const d = new Date(r.tanggal);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const latest = [...regs]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">PCNU Kraksaan</h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan aktivasi organisasi bawahan di bawah PCNU Kraksaan.
          </p>
        </div>

        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <MetricCard label="Total MWC" value="14" />
          <MetricCard label="Total Lembaga PC" value="18" />
          <MetricCard label="Total Ranting" value={String(totalRanting)} />
          <MetricCard label="Pending Review" value={String(pendingReview)} />
          <MetricCard label="Perlu Perbaikan" value={String(needRevision)} />
          <MetricCard label="Sudah Production" value={String(production)} />
          <MetricCard label="Belum Production" value={String(belumProduction)} />
          <MetricCard label="Pengajuan Bulan Ini" value={String(thisMonth)} />
        </div>

        <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">Status Pengajuan Terbaru</h2>
              <p className="text-sm text-muted-foreground">5 pengajuan paling baru.</p>
            </div>
            <Link
              to="/pc/status-pengajuan"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              Lihat Semua Status <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 space-y-2">
            {latest.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Belum ada pengajuan.
              </div>
            ) : (
              latest.map((r) => (
                <div
                  key={r.ticketId}
                  className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{r.namaOrg}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.ticketId} · {r.tipeOrg} · {new Date(r.tanggal).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.status} />
                    <Link
                      to="/pc/status-pengajuan/$ticketId"
                      params={{ ticketId: r.ticketId }}
                      className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground"
                    >
                      Lihat Status
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 sm:hidden">
            <Link
              to="/pc/status-pengajuan"
              className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
            >
              Lihat Semua Status <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Aksi Cepat</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <QuickAction
              to="/pc/daftarkan"
              icon={PlusCircle}
              title="Daftarkan Organisasi Bawahan"
              desc="MWC, Lembaga PC, atau Ranting."
            />
            <QuickAction
              to="/pc/daftarkan/import"
              icon={Upload}
              title="Import Data Administrator"
              desc="Upload Excel data administrator."
            />
            <QuickAction
              to="/pc/status-pengajuan"
              icon={ListChecks}
              title="Cek Status Pengajuan"
              desc="Pantau progress pengajuan."
            />
          </div>
        </section>

        <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
          Gunakan menu <strong className="text-foreground">Daftarkan Organisasi Bawahan</strong> untuk mendaftarkan MWC, Lembaga PC, atau Ranting.
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition hover:border-primary hover:bg-primary/5"
    >
      <Icon className="h-5 w-5 text-primary" />
      <p className="font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </Link>
  );
}
