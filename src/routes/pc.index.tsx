import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { pcDemoTargets } from "@/lib/demo-scope-data";

export const Route = createFileRoute("/pc/")({
  component: PcDashboard,
});

function PcDashboard() {
  const registrations = useStore((s) => s.registrations);
  const [tab, setTab] = useState<"MWC" | "Lembaga PC">("MWC");

  const regs = useMemo(
    () => registrations.filter((r) => r.sumberPengajuan === "PC_DASHBOARD"),
    [registrations],
  );

  const filteredTargets = pcDemoTargets.filter((item) => item.type === tab);
  const pendingReview = regs.filter((r) => r.status === "Pending").length;
  const needRevision = regs.filter((r) => r.status === "PerluPerbaikan").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">PCNU Kraksaan</h1>
          <p className="text-sm text-muted-foreground">
            Pilih MWC atau Lembaga di bawah PCNU Kraksaan yang akan didaftarkan ke Digdaya.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total MWC" value="14" />
          <MetricCard label="Total Lembaga" value="18" />
          <MetricCard label="Pending Review" value={String(pendingReview)} />
          <MetricCard label="Perlu Perbaikan" value={String(needRevision)} />
        </div>

        <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Organisasi Belum Production</h2>
              <p className="text-sm text-muted-foreground">Pilih target yang akan didaftarkan.</p>
            </div>
            <div className="inline-flex w-full rounded-lg bg-secondary p-1 sm:w-auto">
              {(["MWC", "Lembaga PC"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={tab === item ? "flex-1 rounded-md bg-background px-3 py-2 text-sm font-medium text-foreground sm:flex-none" : "flex-1 rounded-md px-3 py-2 text-sm text-muted-foreground sm:flex-none"}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {filteredTargets.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.type}</p>
                </div>
                <Link
                  to="/pc/daftarkan"
                  search={{ targetId: item.id }}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  Daftarkan
                </Link>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link to="/pc/status-pengajuan" className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground">
            Lihat Status Pengajuan
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
