import { createFileRoute, Link } from "@tanstack/react-router";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { useStore, actions } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  Eye,
  Search,
  Download,
  Sprout,
  Building2,
  Network,
  Sparkles,
  Copy,
  KeySquare,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Layers,
} from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate } from "@/utils/status";
import { toast } from "sonner";
import type { Registration } from "@/data/mockData";

export const Route = createFileRoute("/ops/activation/ranting")({
  component: OpsRantingDataPage,
});

type TabKey = "all" | "no_id" | "with_id" | "active" | "duplicate";

function normalizeName(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function getSystemStatusLabel(systems: Array<"Digdaya Kepengurusan" | "Digdaya Persuratan"> = []) {
  const k = systems.includes("Digdaya Kepengurusan");
  const p = systems.includes("Digdaya Persuratan");
  if (k && p) return "Kepengurusan & Persuratan Aktif";
  if (k) return "Kepengurusan Aktif";
  if (p) return "Persuratan Aktif";
  return "Belum Aktif";
}

function OpsRantingDataPage() {
  const regs = useStore((s) => s.registrations);
  const [q, setQ] = useState("");
  const [pcFilter, setPcFilter] = useState("all");
  const [mwcFilter, setMwcFilter] = useState("all");
  const [idStatusFilter, setIdStatusFilter] = useState("all");
  const [sysFilter, setSysFilter] = useState("all");
  const [tab, setTab] = useState<TabKey>("all");

  // Modals
  const [confirmGen, setConfirmGen] = useState<Registration | null>(null);
  const [confirmActivate, setConfirmActivate] = useState<{
    reg: Registration;
    system: "Digdaya Kepengurusan" | "Digdaya Persuratan";
  } | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [dupCheck, setDupCheck] = useState<Registration | null>(null);
  const [renameTarget, setRenameTarget] = useState<Registration | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [detail, setDetail] = useState<Registration | null>(null);

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

  // Detect duplicates: same normalized name + same parentMwc among approved
  const duplicateTickets = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const r of approvedRanting) {
      const key = `${r.parentMwcId ?? r.parentMwcName ?? ""}::${normalizeName(r.namaOrg)}`;
      const arr = groups.get(key) ?? [];
      arr.push(r.ticketId);
      groups.set(key, arr);
    }
    const dup = new Set<string>();
    for (const arr of groups.values()) {
      if (arr.length > 1) arr.forEach((t) => dup.add(t));
    }
    return dup;
  }, [approvedRanting]);

  const effectiveStatus = (r: Registration): "Belum Dibuat" | "ID Terbuat" | "Siap Aktivasi Sistem" | "Aktif di Digdaya" | "Perlu Cek Duplikasi" => {
    if (!r.managementId && duplicateTickets.has(r.ticketId)) return "Perlu Cek Duplikasi";
    if (!r.managementId) return "Belum Dibuat";
    const sys = r.activatedSystems ?? [];
    if (sys.length >= 2) return "Aktif di Digdaya";
    if (sys.length >= 1) return "Siap Aktivasi Sistem";
    return r.idManagementStatus ?? "ID Terbuat";
  };

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

  const filtered = useMemo(() => {
    return approvedRanting
      .filter((r) => pcFilter === "all" || r.sourcePcName === pcFilter)
      .filter((r) => mwcFilter === "all" || r.parentMwcName === mwcFilter)
      .filter((r) => {
        const st = effectiveStatus(r);
        if (idStatusFilter !== "all" && st !== idStatusFilter) return false;
        return true;
      })
      .filter((r) => {
        if (sysFilter === "all") return true;
        return getSystemStatusLabel(r.activatedSystems) === sysFilter;
      })
      .filter((r) => {
        const st = effectiveStatus(r);
        if (tab === "all") return true;
        if (tab === "no_id") return st === "Belum Dibuat";
        if (tab === "with_id") return st === "ID Terbuat" || st === "Siap Aktivasi Sistem";
        if (tab === "active") return st === "Aktif di Digdaya";
        if (tab === "duplicate") return st === "Perlu Cek Duplikasi";
        return true;
      })
      .filter((r) => {
        if (!q) return true;
        const needle = q.toLowerCase();
        return (
          r.namaOrg.toLowerCase().includes(needle) ||
          (r.sourcePcName ?? "").toLowerCase().includes(needle) ||
          (r.parentMwcName ?? "").toLowerCase().includes(needle) ||
          r.namaAdmin.toLowerCase().includes(needle) ||
          r.ticketId.toLowerCase().includes(needle) ||
          (r.managementId ?? "").toLowerCase().includes(needle)
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvedRanting, q, pcFilter, mwcFilter, idStatusFilter, sysFilter, tab, duplicateTickets]);

  // KPIs
  const total = approvedRanting.length;
  const noId = approvedRanting.filter((r) => !r.managementId && !duplicateTickets.has(r.ticketId)).length;
  const withId = approvedRanting.filter((r) => r.managementId && (r.activatedSystems?.length ?? 0) < 2).length;
  const activeAll = approvedRanting.filter((r) => (r.activatedSystems?.length ?? 0) >= 2).length;

  const copyId = (id: string) => {
    navigator.clipboard?.writeText(id).then(
      () => toast.success("ID Manajemen berhasil disalin."),
      () => toast.error("Gagal menyalin ID."),
    );
  };

  const doGenerate = (reg: Registration) => {
    const id = actions.generateRantingManagementId(reg.ticketId);
    if (id) {
      toast.success(`ID Manajemen ${id} berhasil dibuat.`);
    } else {
      toast.error("ID Manajemen tidak dapat dibuat. Periksa data atau duplikasi.");
    }
    setConfirmGen(null);
  };

  const doActivate = () => {
    if (!confirmActivate) return;
    const { reg, system } = confirmActivate;
    actions.activateRantingSystem(reg.ticketId, system);
    toast.success(`Ranting berhasil diaktifkan di ${system}.`);
    setConfirmActivate(null);
  };

  const validBulk = approvedRanting.filter(
    (r) => !r.managementId && !duplicateTickets.has(r.ticketId),
  );
  const skippedBulk = approvedRanting.filter(
    (r) => !r.managementId && duplicateTickets.has(r.ticketId),
  ).length;

  const doBulk = () => {
    const ids = validBulk.map((r) => r.ticketId);
    const { created, skipped } = actions.bulkGenerateRantingManagementIds(ids);
    const totalSkipped = skipped + skippedBulk;
    toast.success(
      `${created} ID Manajemen berhasil dibuat${totalSkipped ? `. ${totalSkipped} data dilewati karena perlu cek duplikasi.` : "."}`,
    );
    setConfirmBulk(false);
  };

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast.error("Tidak ada data untuk diexport.");
      return;
    }
    const headers = [
      "ID Manajemen",
      "Nama Ranting",
      "PC Induk",
      "MWC Induk",
      "Wilayah/Desa",
      "Administrator",
      "WhatsApp",
      "Email",
      "Nomor Tiket",
      "Status ID",
      "Status Sistem",
      "Tanggal Generate ID",
    ];
    const rows = filtered.map((r) => [
      r.managementId ?? "",
      r.namaOrg,
      r.sourcePcName ?? "",
      r.parentMwcName ?? "",
      r.village ?? "",
      r.namaAdmin,
      r.hp,
      r.email,
      r.ticketId,
      effectiveStatus(r),
      getSystemStatusLabel(r.activatedSystems),
      r.managementGeneratedAt ? formatDate(r.managementGeneratedAt) : "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
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
        subtitle="Kelola Ranting yang sudah disetujui dan buat ID Manajemen untuk integrasi ke Digdaya Kepengurusan dan Persuratan."
        breadcrumb={[
          { label: "Portal Aktivasi", to: "/ops/activation" },
          { label: "Data Ranting" },
        ]}
      />
      <OpsPageBody>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Kpi label="Total Ranting Approved" value={total} icon={Sprout} tone="success" />
          <Kpi label="Belum Dibuatkan ID" value={noId} icon={KeySquare} tone="warning" />
          <Kpi label="ID Terbuat" value={withId} icon={Layers} tone="info" />
          <Kpi label="Aktif di Digdaya" value={activeAll} icon={ShieldCheck} tone="primary" />
        </div>

        <OpsCard
          title="Daftar Ranting Approved"
          description={`Total ${filtered.length} Ranting ditemukan.`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={() => setConfirmBulk(true)}
                disabled={validBulk.length === 0}
              >
                <Sparkles className="mr-1.5 h-4 w-4" /> Buat ID untuk Semua yang Valid
              </Button>
              <Button size="sm" variant="outline" onClick={exportCsv}>
                <Download className="mr-1.5 h-4 w-4" /> Export Data
              </Button>
            </div>
          }
        >
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
            {([
              { k: "all", l: "Semua" },
              { k: "no_id", l: "Belum Punya ID" },
              { k: "with_id", l: "Sudah Punya ID" },
              { k: "active", l: "Aktif di Digdaya" },
              { k: "duplicate", l: "Perlu Cek Duplikasi" },
            ] as Array<{ k: TabKey; l: string }>).map((t) => (
              <button
                key={t.k}
                type="button"
                onClick={() => setTab(t.k)}
                className={
                  "rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors " +
                  (tab === t.k
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80")
                }
              >
                {t.l}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <div className="relative w-full sm:flex-1 sm:min-w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama ranting, PC, MWC, ID Manajemen, atau administrator"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-10 w-full pl-9"
              />
            </div>
            <Select
              value={pcFilter}
              onValueChange={(v) => {
                setPcFilter(v);
                setMwcFilter("all");
              }}
            >
              <SelectTrigger className="h-10 w-full sm:w-[180px]">
                <SelectValue placeholder="Semua PC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua PC Induk</SelectItem>
                {pcOptions.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={mwcFilter} onValueChange={setMwcFilter}>
              <SelectTrigger className="h-10 w-full sm:w-[180px]">
                <SelectValue placeholder="Semua MWC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua MWC Induk</SelectItem>
                {mwcOptions.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={idStatusFilter} onValueChange={setIdStatusFilter}>
              <SelectTrigger className="h-10 w-full sm:w-[180px]">
                <SelectValue placeholder="Status ID" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status ID</SelectItem>
                <SelectItem value="Belum Dibuat">Belum Dibuat</SelectItem>
                <SelectItem value="ID Terbuat">ID Terbuat</SelectItem>
                <SelectItem value="Siap Aktivasi Sistem">Siap Aktivasi Sistem</SelectItem>
                <SelectItem value="Aktif di Digdaya">Aktif di Digdaya</SelectItem>
                <SelectItem value="Perlu Cek Duplikasi">Perlu Cek Duplikasi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sysFilter} onValueChange={setSysFilter}>
              <SelectTrigger className="h-10 w-full sm:w-[180px]">
                <SelectValue placeholder="Status Sistem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status Sistem</SelectItem>
                <SelectItem value="Belum Aktif">Belum Aktif</SelectItem>
                <SelectItem value="Kepengurusan Aktif">Kepengurusan Aktif</SelectItem>
                <SelectItem value="Persuratan Aktif">Persuratan Aktif</SelectItem>
                <SelectItem value="Kepengurusan & Persuratan Aktif">
                  Kepengurusan & Persuratan Aktif
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Desktop table */}
              <div className="mt-4 hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1280px] text-[13px]">
                  <thead className="bg-secondary/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2.5">Nama Ranting</th>
                      <th className="px-3 py-2.5">PC Induk</th>
                      <th className="px-3 py-2.5">MWC Induk</th>
                      <th className="px-3 py-2.5">Wilayah</th>
                      <th className="px-3 py-2.5">Administrator</th>
                      <th className="px-3 py-2.5">Tiket</th>
                      <th className="px-3 py-2.5">Status ID</th>
                      <th className="px-3 py-2.5">ID Manajemen</th>
                      <th className="px-3 py-2.5">Tgl Generate</th>
                      <th className="px-3 py-2.5">Status Sistem</th>
                      <th className="px-3 py-2.5 text-right pr-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => {
                      const st = effectiveStatus(r);
                      return (
                        <tr key={r.ticketId} className="border-t border-border">
                          <td className="px-3 py-2.5 font-medium text-foreground">{r.namaOrg}</td>
                          <td className="px-3 py-2.5 text-muted-foreground">{r.sourcePcName ?? "—"}</td>
                          <td className="px-3 py-2.5 text-muted-foreground">{r.parentMwcName ?? "—"}</td>
                          <td className="px-3 py-2.5 text-muted-foreground">{r.village ?? "—"}</td>
                          <td className="px-3 py-2.5">{r.namaAdmin}</td>
                          <td className="px-3 py-2.5 font-mono text-[12px] text-primary-dark">{r.ticketId}</td>
                          <td className="px-3 py-2.5">
                            <IdStatusPill status={st} />
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[12px]">
                            {r.managementId ? (
                              <span className="inline-flex items-center gap-1.5">
                                {r.managementId}
                                <button
                                  type="button"
                                  onClick={() => copyId(r.managementId!)}
                                  className="text-muted-foreground hover:text-primary"
                                  title="Salin ID"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-[12px]">
                            {r.managementGeneratedAt ? formatDate(r.managementGeneratedAt) : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-[12px]">
                            {getSystemStatusLabel(r.activatedSystems)}
                          </td>
                          <td className="px-3 py-2.5 text-right pr-4">
                            <RowActions
                              reg={r}
                              status={st}
                              onGenerate={() => setConfirmGen(r)}
                              onActivate={(sys) => setConfirmActivate({ reg: r, system: sys })}
                              onCopy={() => r.managementId && copyId(r.managementId)}
                              onDup={() => setDupCheck(r)}
                              onDetail={() => setDetail(r)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="mt-3 space-y-2.5 md:hidden">
                {filtered.map((r) => {
                  const st = effectiveStatus(r);
                  return (
                    <div key={r.ticketId} className="rounded-md border border-border bg-background p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-medium text-foreground">{r.namaOrg}</p>
                          <p className="text-[11.5px] text-muted-foreground">
                            {r.sourcePcName ?? "—"} · {r.parentMwcName ?? "—"}
                          </p>
                        </div>
                        <IdStatusPill status={st} />
                      </div>
                      <div className="mt-2 text-[12px] text-muted-foreground">
                        {r.namaAdmin} · <span className="font-mono text-foreground">{r.ticketId}</span>
                      </div>
                      <div className="mt-1 text-[12px]">
                        {r.managementId ? (
                          <span className="font-mono text-foreground">{r.managementId}</span>
                        ) : (
                          <span className="text-muted-foreground">ID belum dibuat</span>
                        )}
                        <span className="mx-1.5 text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{getSystemStatusLabel(r.activatedSystems)}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-1.5">
                        <RowActions
                          reg={r}
                          status={st}
                          fullWidth
                          onGenerate={() => setConfirmGen(r)}
                          onActivate={(sys) => setConfirmActivate({ reg: r, system: sys })}
                          onCopy={() => r.managementId && copyId(r.managementId)}
                          onDup={() => setDupCheck(r)}
                          onDetail={() => setDetail(r)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </OpsCard>
      </OpsPageBody>

      {/* Generate ID modal */}
      <Dialog open={!!confirmGen} onOpenChange={(o) => !o && setConfirmGen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat ID Manajemen Ranting?</DialogTitle>
            <DialogDescription>
              ID Manajemen akan dibuat untuk{" "}
              <strong>{confirmGen?.namaOrg}</strong> di bawah{" "}
              <strong>{confirmGen?.parentMwcName}</strong>, {confirmGen?.sourcePcName}.
            </DialogDescription>
          </DialogHeader>
          {confirmGen && (
            <div className="space-y-1.5 rounded-md border border-border bg-secondary/40 p-3 text-[13px]">
              <KV label="Nama Ranting" value={confirmGen.namaOrg} />
              <KV label="MWC Induk" value={confirmGen.parentMwcName ?? "—"} />
              <KV label="PC Induk" value={confirmGen.sourcePcName ?? "—"} />
              <KV label="Nomor Tiket" value={confirmGen.ticketId} mono />
              <KV label="Administrator" value={confirmGen.namaAdmin} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmGen(null)}>
              Batal
            </Button>
            <Button onClick={() => confirmGen && doGenerate(confirmGen)}>Buat ID Manajemen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate system modal */}
      <Dialog open={!!confirmActivate} onOpenChange={(o) => !o && setConfirmActivate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Aktifkan Ranting ini di {confirmActivate?.system}?
            </DialogTitle>
            <DialogDescription>
              Ranting <strong>{confirmActivate?.reg.namaOrg}</strong> akan ditautkan ke{" "}
              {confirmActivate?.system}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmActivate(null)}>
              Batal
            </Button>
            <Button onClick={doActivate}>Aktifkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk modal */}
      <Dialog open={confirmBulk} onOpenChange={setConfirmBulk}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat ID Manajemen untuk semua data valid?</DialogTitle>
            <DialogDescription>
              {validBulk.length} Ranting valid akan dibuatkan ID Manajemen.
              {skippedBulk > 0 && ` ${skippedBulk} data dilewati karena perlu cek duplikasi.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmBulk(false)}>
              Batal
            </Button>
            <Button onClick={doBulk} disabled={validBulk.length === 0}>
              Buat ID Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate check modal */}
      <Dialog open={!!dupCheck} onOpenChange={(o) => !o && setDupCheck(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cek Duplikasi Ranting</DialogTitle>
            <DialogDescription>
              Terdeteksi nama Ranting yang sama di bawah MWC yang sama. Periksa data berikut sebelum
              membuat ID Manajemen.
            </DialogDescription>
          </DialogHeader>
          {dupCheck && (
            <div className="space-y-3">
              <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-[13px]">
                <p className="font-semibold text-foreground">Data saat ini</p>
                <KV label="Nama Ranting" value={dupCheck.namaOrg} />
                <KV label="MWC Induk" value={dupCheck.parentMwcName ?? "—"} />
                <KV label="Nomor Tiket" value={dupCheck.ticketId} mono />
                <KV label="Administrator" value={dupCheck.namaAdmin} />
              </div>
              <div className="space-y-2">
                <p className="text-[12.5px] font-semibold text-foreground">Data Ranting Mirip</p>
                {approvedRanting
                  .filter(
                    (r) =>
                      r.ticketId !== dupCheck.ticketId &&
                      (r.parentMwcId ?? r.parentMwcName ?? "") === (dupCheck.parentMwcId ?? dupCheck.parentMwcName ?? "") &&
                      normalizeName(r.namaOrg) === normalizeName(dupCheck.namaOrg),
                  )
                  .map((r) => (
                    <div key={r.ticketId} className="rounded-md border border-border bg-secondary/30 p-3 text-[13px]">
                      <KV label="Nama Ranting" value={r.namaOrg} />
                      <KV label="Nomor Tiket" value={r.ticketId} mono />
                      <KV label="Administrator" value={r.namaAdmin} />
                      <KV label="ID Manajemen" value={r.managementId ?? "—"} mono />
                    </div>
                  ))}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDupCheck(null)}>
              Abaikan
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (dupCheck) {
                  setRenameTarget(dupCheck);
                  setRenameValue(dupCheck.namaOrg);
                  setDupCheck(null);
                }
              }}
            >
              Koreksi Nama
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename modal */}
      <Dialog open={!!renameTarget} onOpenChange={(o) => !o && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Koreksi Nama Ranting</DialogTitle>
            <DialogDescription>
              Perbarui nama Ranting untuk menghindari duplikasi.
            </DialogDescription>
          </DialogHeader>
          <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                if (renameTarget) {
                  actions.renameRanting(renameTarget.ticketId, renameValue);
                  toast.success("Nama Ranting diperbarui.");
                  setRenameTarget(null);
                }
              }}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail modal */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Ranting</DialogTitle>
            <DialogDescription>
              Informasi lengkap Ranting dan status integrasi sistem.
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-[13px]">
              <DetailCard title="Identitas Ranting">
                <KV label="Nama Ranting" value={detail.namaOrg} />
                <KV label="ID Manajemen" value={detail.managementId ?? "—"} mono />
                <KV label="Status ID" value={effectiveStatus(detail)} />
                <KV label="Status Sistem" value={getSystemStatusLabel(detail.activatedSystems)} />
                <KV
                  label="Tgl Generate ID"
                  value={detail.managementGeneratedAt ? formatDate(detail.managementGeneratedAt) : "—"}
                />
                <KV label="Dibuat Oleh" value={detail.managementGeneratedBy ?? "—"} />
              </DetailCard>
              <DetailCard title="Struktur Organisasi">
                <KV label="PC Induk" value={detail.sourcePcName ?? "—"} />
                <KV label="MWC Induk" value={detail.parentMwcName ?? "—"} />
                <KV label="Wilayah/Desa" value={detail.village ?? "—"} />
                <KV label="Catatan Lokasi" value={detail.locationNote ?? "—"} />
              </DetailCard>
              <DetailCard title="Administrator">
                <KV label="Nama" value={detail.namaAdmin} />
                <KV label="Jabatan" value={detail.jabatan} />
                <KV label="WhatsApp" value={detail.hp} />
                <KV label="Email" value={detail.email} />
              </DetailCard>
              <DetailCard title="Sumber Pengajuan">
                <KV label="Nomor Tiket" value={detail.ticketId} mono />
                <KV
                  label="Tanggal Disetujui"
                  value={detail.reviewedAt ? formatDate(detail.reviewedAt) : "—"}
                />
                <Link
                  to="/ops/activation/submissions/$ticketId"
                  params={{ ticketId: detail.ticketId }}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" /> Lihat Detail Pengajuan
                </Link>
              </DetailCard>
            </div>
          )}
          <DialogFooter className="gap-2">
            {detail && <WhatsAppButton phone={detail.hp} ticketId={detail.ticketId} />}
            <Button variant="outline" onClick={() => setDetail(null)}>
              Kembali
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RowActions({
  reg,
  status,
  fullWidth,
  onGenerate,
  onActivate,
  onCopy,
  onDup,
  onDetail,
}: {
  reg: Registration;
  status: "Belum Dibuat" | "ID Terbuat" | "Siap Aktivasi Sistem" | "Aktif di Digdaya" | "Perlu Cek Duplikasi";
  fullWidth?: boolean;
  onGenerate: () => void;
  onActivate: (sys: "Digdaya Kepengurusan" | "Digdaya Persuratan") => void;
  onCopy: () => void;
  onDup: () => void;
  onDetail: () => void;
}) {
  const cls = "h-8 " + (fullWidth ? "w-full justify-center" : "");
  const sysActivated = reg.activatedSystems ?? [];
  return (
    <div className={fullWidth ? "contents" : "flex flex-wrap items-center justify-end gap-1.5"}>
      <Button size="sm" variant="outline" className={cls} onClick={onDetail}>
        <Eye className="mr-1.5 h-3.5 w-3.5" /> Detail
      </Button>
      {status === "Belum Dibuat" && (
        <Button size="sm" className={cls} onClick={onGenerate}>
          <KeySquare className="mr-1.5 h-3.5 w-3.5" /> Buat ID
        </Button>
      )}
      {status === "Perlu Cek Duplikasi" && (
        <Button size="sm" variant="outline" className={cls} onClick={onDup}>
          <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Cek Duplikasi
        </Button>
      )}
      {(status === "ID Terbuat" || status === "Siap Aktivasi Sistem" || status === "Aktif di Digdaya") && (
        <>
          <Button size="sm" variant="outline" className={cls} onClick={onCopy}>
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Salin ID
          </Button>
          {!sysActivated.includes("Digdaya Kepengurusan") && (
            <Button size="sm" variant="outline" className={cls} onClick={() => onActivate("Digdaya Kepengurusan")}>
              Aktifkan Kepengurusan
            </Button>
          )}
          {!sysActivated.includes("Digdaya Persuratan") && (
            <Button size="sm" variant="outline" className={cls} onClick={() => onActivate("Digdaya Persuratan")}>
              Aktifkan Persuratan
            </Button>
          )}
        </>
      )}
      <WhatsAppButton phone={reg.hp} ticketId={reg.ticketId} className={fullWidth ? "w-full justify-center" : ""} />
    </div>
  );
}

function IdStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Belum Dibuat": "bg-secondary text-muted-foreground",
    "ID Terbuat": "bg-info/15 text-info",
    "Siap Aktivasi Sistem": "bg-primary/10 text-primary",
    "Aktif di Digdaya": "bg-success/15 text-success",
    "Perlu Cek Duplikasi": "bg-warning/20 text-warning-foreground",
  };
  return (
    <Badge variant="outline" className={"border-0 " + (map[status] ?? "bg-secondary text-muted-foreground")}>
      {status}
    </Badge>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[11.5px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={"text-right text-[13px] text-foreground " + (mono ? "font-mono" : "")}>{value}</span>
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3">
      <p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-4 flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-secondary/30 px-4 py-10 text-center">
      <Sprout className="h-8 w-8 text-muted-foreground" />
      <p className="text-[14px] font-semibold text-foreground">Tidak ada Ranting yang cocok</p>
      <p className="max-w-md text-[12.5px] text-muted-foreground">
        Ubah filter atau tunggu pengajuan Ranting baru disetujui.
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

// Keep imports used in JSX
void Building2;
void Network;
