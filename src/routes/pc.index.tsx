import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, effectiveStatusOrg } from "@/lib/store";
import { pcDemoTargets } from "@/lib/demo-scope-data";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/pc/")({
  component: PcDashboard,
});

type Tab = "MWC" | "Lembaga PC" | "Ranting";

function PcDashboard() {
  const registrations = useStore((s) => s.registrations);
  const orgStatus = useStore((s) => s.orgStatus);
  const [tab, setTab] = useState<Tab>("MWC");

  const regs = useMemo(
    () => registrations.filter((r) => r.sumberPengajuan === "PC_DASHBOARD"),
    [registrations],
  );

  const rantingRegs = useMemo(
    () => regs.filter((r) => r.tipeOrg === "Ranting"),
    [regs],
  );

  const pendingReview = regs.filter((r) => r.status === "Pending").length;
  const needRevision = regs.filter((r) => r.status === "PerluPerbaikan").length;
  const totalRanting = rantingRegs.length;
  const rantingProduction = rantingRegs.filter(
    (r) => r.selectedOrgId && effectiveStatusOrg(r.selectedOrgId) === "Production",
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">PCNU Kraksaan</h1>
          <p className="text-sm text-muted-foreground">
            Daftarkan MWC, Lembaga, atau Ranting di bawah PCNU Kraksaan ke Digdaya.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Total MWC" value="14" />
          <MetricCard label="Total Lembaga" value="18" />
          <MetricCard label="Total Ranting" value={String(totalRanting)} sub={`${rantingProduction} sudah production`} />
          <MetricCard label="Pending Review" value={String(pendingReview)} />
          <MetricCard label="Perlu Perbaikan" value={String(needRevision)} />
          <MetricCard label="Sudah Production" value={String(regs.filter((r) => r.status === "Approved").length)} />
        </div>

        <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">Organisasi Bawahan</h2>
              <p className="text-sm text-muted-foreground">Pilih tab untuk melihat & mendaftarkan organisasi.</p>
            </div>
            <div className="-mx-1 flex w-full overflow-x-auto sm:mx-0 sm:w-auto">
              <div className="inline-flex w-max rounded-lg bg-secondary p-1">
                {(["MWC", "Lembaga PC", "Ranting"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTab(item)}
                    className={
                      tab === item
                        ? "whitespace-nowrap rounded-md bg-background px-3 py-2 text-sm font-medium text-foreground"
                        : "whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted-foreground"
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            {tab === "Ranting" ? (
              <RantingPanel regs={rantingRegs} />
            ) : (
              <TargetList type={tab} />
            )}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/pc/status-pengajuan"
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
          >
            Lihat Status Pengajuan
          </Link>
        </div>
      </div>
    </div>
  );
}

function TargetList({ type }: { type: "MWC" | "Lembaga PC" }) {
  const filteredTargets = pcDemoTargets.filter((item) => item.type === type);
  return (
    <div className="space-y-3">
      {filteredTargets.map((item) => (
        <div
          key={item.id}
          className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.type}</p>
          </div>
          <Link
            to="/pc/daftarkan"
            search={{ targetId: item.id }}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:w-auto"
          >
            Daftarkan
          </Link>
        </div>
      ))}
    </div>
  );
}

function RantingPanel({ regs }: { regs: ReturnType<typeof Array.prototype.slice> }) {
  type R = (typeof regs)[number];
  const list = regs as R[];
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Data Ranting belum tersedia di master data terpusat. Input dari PC akan menjadi cikal-bakal master data Ranting setelah diverifikasi.
        </p>
        <Link
          to="/pc/daftarkan"
          search={{ type: "ranting" }}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:w-auto"
        >
          Tambah Ranting
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="rounded-lg border border-border p-6 text-center">
          <p className="text-sm font-medium text-foreground">Belum ada data Ranting yang diinput.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tambahkan Ranting di bawah MWC/PCNU Kraksaan untuk memulai proses aktivasi.
          </p>
        </div>
      ) : (
        list.map((r) => {
          const prod = r.selectedOrgId ? effectiveStatusOrg(r.selectedOrgId) : "Belum Production";
          return (
            <div
              key={r.ticketId}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{r.namaOrg}</p>
                <p className="text-sm text-muted-foreground">
                  Induk: {r.parentMwcName ?? "—"} · {r.ticketId}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={r.status} />
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                    {prod}
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Link
                  to="/pc/status-pengajuan/$ticketId"
                  params={{ ticketId: r.ticketId }}
                  className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
                >
                  Lihat Status
                </Link>
                {r.status === "PerluPerbaikan" && (
                  <Link
                    to="/pc/status-pengajuan/$ticketId/revisi"
                    params={{ ticketId: r.ticketId }}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Perbaiki
                  </Link>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
