import { createFileRoute, Link } from "@tanstack/react-router";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Eye, Search, Download, Sprout, Building2, Network, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate } from "@/utils/status";
import { toast } from "sonner";

export const Route = createFileRoute("/ops/activation/ranting")({
  component: OpsRantingDataPage,
});

function OpsRantingDataPage() {
  const regs = useStore((s) => s.registrations);
  const [q, setQ] = useState("");
  const [pcFilter, setPcFilter] = useState("all");
  const [mwcFilter, setMwcFilter] = useState("all");

  const approvedRanting = useMemo(
    () =>
      regs
        .filter((r) => r.tipeOrg === "Ranting" && r.status === "Approved")
        .sort(
          (a, b) =>
            new Date(b.reviewedAt ?? b.submittedAt).getTime() -
            new Date(a.reviewedAt ?? a.submittedAt).getTime(),
        ),
    [regs],
  );

  const pcOptions = useMemo(
    () => Array.from(new Set(approvedRanting.map((r) => r.sourcePcName).filter(Boolean) as string[])),
    [approvedRanting],
  );
  const mwcOptions = useMemo(
    () =>
      Array.from(
        new Set(
          approvedRanting
            .filter((r) => pcFilter === "all" || r.sourcePcName === pcFilter)
            .map((r) => r.parentMwcName)
            .filter(Boolean) as string[],
        ),
      ),
    [approvedRanting, pcFilter],
  );

  const filtered = useMemo(
    () =>
      approvedRanting
        .filter((r) => pcFilter === "all" || r.sourcePcName === pcFilter)
        .filter((r) => mwcFilter === "all" || r.parentMwcName === mwcFilter)
        .filter((r) => {
          if (!q) return true;
          const needle = q.toLowerCase();
          return (
            r.namaOrg.toLowerCase().includes(needle) ||
            (r.sourcePcName ?? "").toLowerCase().includes(needle) ||
            (r.parentMwcName ?? "").toLowerCase().includes(needle) ||
            r.namaAdmin.toLowerCase().includes(needle) ||
            r.ticketId.toLowerCase().includes(needle)
          );
        }),
    [approvedRanting, q, pcFilter, mwcFilter],
  );

  const now = new Date();
  const newThisMonth = approvedRanting.filter((r) => {
    const d = new Date(r.reviewedAt ?? r.submittedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  const uniquePc = new Set(approvedRanting.map((r) => r.sourcePcName).filter(Boolean)).size;
  const uniqueMwc = new Set(approvedRanting.map((r) => r.parentMwcName).filter(Boolean)).size;

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast.error("Tidak ada data untuk diexport.");
      return;
    }
    const headers = [
      "Nama Ranting",
      "PC Induk",
      "MWC Induk",
      "Wilayah/Desa",
      "Administrator",
      "WhatsApp",
      "Email",
      "Nomor Tiket",
      "Tanggal Disetujui",
      "Status",
    ];
    const rows = filtered.map((r) => [
      r.namaOrg,
      r.sourcePcName ?? "",
      r.parentMwcName ?? "",
      r.village ?? "",
      r.namaAdmin,
      r.hp,
      r.email,
      r.ticketId,
      r.reviewedAt ? formatDate(r.reviewedAt) : "",
      "Production",
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data-ranting-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data Ranting diexport.");
  };

  return (
    <div>
      <OpsPageHeader
        title="Data Ranting"
        subtitle="Daftar Ranting yang sudah aktif berdasarkan pengajuan aktivasi yang telah disetujui."
        breadcrumb={[
          { label: "Portal Aktivasi", to: "/ops/activation" },
          { label: "Data Ranting" },
        ]}
      />
      <OpsPageBody>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Kpi label="Total Ranting Aktif" value={approvedRanting.length} icon={Sprout} tone="success" />
          <Kpi label="Total PC Induk" value={uniquePc} icon={Building2} tone="primary" />
          <Kpi label="Total MWC Induk" value={uniqueMwc} icon={Network} tone="info" />
          <Kpi label="Ranting Baru Bulan Ini" value={newThisMonth} icon={Sparkles} tone="warning" />
        </div>

        <OpsCard
          title="Daftar Ranting Aktif"
          description={`Total ${filtered.length} Ranting ditemukan.`}
          action={
            <Button size="sm" variant="outline" onClick={exportCsv}>
              <Download className="mr-1.5 h-4 w-4" /> Export Data
            </Button>
          }
        >
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:flex-1 sm:min-w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama ranting, PC, MWC, atau administrator"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-10 w-full pl-9"
              />
            </div>
            <Select value={pcFilter} onValueChange={(v) => { setPcFilter(v); setMwcFilter("all"); }}>
              <SelectTrigger className="h-10 w-full sm:w-[200px]">
                <SelectValue placeholder="Semua PC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua PC Induk</SelectItem>
                {pcOptions.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={mwcFilter} onValueChange={setMwcFilter}>
              <SelectTrigger className="h-10 w-full sm:w-[200px]">
                <SelectValue placeholder="Semua MWC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua MWC Induk</SelectItem>
                {mwcOptions.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Desktop table */}
              <div className="mt-4 hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1024px] text-[13px]">
                  <thead className="bg-secondary/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2.5">Nama Ranting</th>
                      <th className="px-3 py-2.5">PC Induk</th>
                      <th className="px-3 py-2.5">MWC Induk</th>
                      <th className="px-3 py-2.5">Wilayah / Desa</th>
                      <th className="px-3 py-2.5">Administrator</th>
                      <th className="px-3 py-2.5">Email</th>
                      <th className="px-3 py-2.5">Nomor Tiket</th>
                      <th className="px-3 py-2.5">Tgl Disetujui</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5 text-right pr-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.ticketId} className="border-t border-border">
                        <td className="px-3 py-2.5 font-medium text-foreground">{r.namaOrg}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{r.sourcePcName ?? "—"}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{r.parentMwcName ?? "—"}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{r.village ?? "—"}</td>
                        <td className="px-3 py-2.5">{r.namaAdmin}</td>
                        <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{r.email}</td>
                        <td className="px-3 py-2.5 font-mono text-[12px] text-primary-dark">{r.ticketId}</td>
                        <td className="px-3 py-2.5 text-[12px]">{r.reviewedAt ? formatDate(r.reviewedAt) : "—"}</td>
                        <td className="px-3 py-2.5"><ProductionPill /></td>
                        <td className="px-3 py-2.5 text-right pr-4">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <Link to="/ops/activation/submissions/$ticketId" params={{ ticketId: r.ticketId }}>
                              <Button size="sm" variant="outline" className="h-8">
                                <Eye className="mr-1.5 h-3.5 w-3.5" /> Lihat Detail
                              </Button>
                            </Link>
                            <WhatsAppButton phone={r.hp} ticketId={r.ticketId} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile list */}
              <div className="mt-3 space-y-2.5 md:hidden">
                {filtered.map((r) => (
                  <div key={r.ticketId} className="rounded-md border border-border bg-background p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-medium text-foreground">{r.namaOrg}</p>
                        <p className="text-[11.5px] text-muted-foreground">
                          {r.sourcePcName ?? "—"} · {r.parentMwcName ?? "—"}
                        </p>
                      </div>
                      <ProductionPill />
                    </div>
                    <div className="mt-2 text-[12px] text-muted-foreground">
                      {r.namaAdmin} · <span className="font-mono text-foreground">{r.ticketId}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                      <Link to="/ops/activation/submissions/$ticketId" params={{ ticketId: r.ticketId }}>
                        <Button size="sm" variant="outline" className="h-8 w-full">
                          <Eye className="mr-1.5 h-3.5 w-3.5" /> Detail
                        </Button>
                      </Link>
                      <WhatsAppButton phone={r.hp} ticketId={r.ticketId} className="w-full justify-center" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </OpsCard>
      </OpsPageBody>
    </div>
  );
}

function ProductionPill() {
  return (
    <span className="inline-flex items-center rounded-full bg-[oklch(0.94_0.06_150)] px-2 py-0.5 text-[11px] font-medium text-[oklch(0.36_0.10_152)]">
      Production
    </span>
  );
}

function EmptyState() {
  return (
    <div className="mt-4 flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-secondary/30 px-4 py-10 text-center">
      <Sprout className="h-8 w-8 text-muted-foreground" />
      <p className="text-[14px] font-semibold text-foreground">Belum ada Ranting aktif</p>
      <p className="max-w-md text-[12.5px] text-muted-foreground">
        Ranting akan muncul di halaman ini setelah pengajuan aktivasi Ranting disetujui.
      </p>
      <Link to="/ops/activation/submissions" className="mt-2">
        <Button size="sm" variant="outline">Lihat Pengajuan Aktivasi</Button>
      </Link>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "primary" | "success" | "warning" | "info";
}) {
  const toneCls: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    info: "bg-info/15 text-info",
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
