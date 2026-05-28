import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { StatusBadge } from "@/components/StatusBadge";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Inbox } from "lucide-react";
import type { Status, TipeOrg, SumberSuratTugas } from "@/data/mockData";

export const Route = createFileRoute("/pc/status-pengajuan/")({
  component: StatusPengajuan,
});

type TypeFilter = "ALL" | "MWC" | "Lembaga PC" | "Ranting";
type StatusFilter = "ALL" | Status;
type SourceFilter = "ALL" | SumberSuratTugas;

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "ALL", label: "Semua Tipe" },
  { value: "MWC", label: "MWC" },
  { value: "Lembaga PC", label: "Lembaga PC" },
  { value: "Ranting", label: "Ranting" },
];

function StatusPengajuan() {
  const registrations = useStore((s) => s.registrations);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("ALL");

  const regs = useMemo(
    () => registrations.filter((r) => r.sumberPengajuan === "PC_DASHBOARD"),
    [registrations],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return regs.filter((r) => {
      if (typeFilter !== "ALL" && r.tipeOrg !== typeFilter) return false;
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (sourceFilter !== "ALL" && r.sumberSuratTugas !== sourceFilter) return false;
      if (q) {
        const hay = `${r.ticketId} ${r.namaOrg} ${r.namaAdmin}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [regs, search, typeFilter, statusFilter, sourceFilter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Status Pengajuan</h1>
          <p className="text-sm text-muted-foreground">
            Pantau status pengajuan aktivasi MWC, Lembaga PC, dan Ranting.
          </p>
        </div>

        <Filters
          search={search}
          onSearch={setSearch}
          typeFilter={typeFilter}
          setTypeFilter={(v) => setTypeFilter(v as TypeFilter)}
          typeOptions={TYPE_OPTIONS}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
        />

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <DesktopTable rows={filtered} scope="pc" />
            <MobileList rows={filtered} scope="pc" />
          </>
        )}
      </div>
    </div>
  );
}

// ---------------- Shared UI (kept local to PC, mirrored on PW) ----------------

function Filters(props: {
  search: string;
  onSearch: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  typeOptions: { value: string; label: string }[];
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
  sourceFilter: SourceFilter;
  setSourceFilter: (v: SourceFilter) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={props.search}
            onChange={(e) => props.onSearch(e.target.value)}
            placeholder="Cari nomor tiket, organisasi, atau administrator"
            className="pl-9"
          />
        </div>
        <Select value={props.statusFilter} onValueChange={(v) => props.setStatusFilter(v as StatusFilter)}>
          <SelectTrigger><SelectValue placeholder="Semua Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="Pending">Pending Review</SelectItem>
            <SelectItem value="PerluPerbaikan">Perlu Perbaikan</SelectItem>
            <SelectItem value="Approved">Disetujui</SelectItem>
            <SelectItem value="RejectedFinal">Ditolak Final</SelectItem>
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <Select value={props.typeFilter} onValueChange={props.setTypeFilter}>
            <SelectTrigger><SelectValue placeholder="Semua Tipe" /></SelectTrigger>
            <SelectContent>
              {props.typeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={props.sourceFilter} onValueChange={(v) => props.setSourceFilter(v as SourceFilter)}>
            <SelectTrigger><SelectValue placeholder="Sumber ST" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Sumber</SelectItem>
              <SelectItem value="DIGDAYA_PERSURATAN">Dari Sistem</SelectItem>
              <SelectItem value="MANUAL_UPLOAD">Upload Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function sumberLabel(s: SumberSuratTugas) {
  return s === "DIGDAYA_PERSURATAN" ? "Dari Sistem" : "Upload Manual";
}

type Row = {
  ticketId: string;
  namaOrg: string;
  tipeOrg: TipeOrg;
  namaAdmin: string;
  hp: string;
  status: Status;
  submittedAt: string;
  sumberSuratTugas: SumberSuratTugas;
  revisionCount?: number;
};

function DesktopTable({ rows, scope }: { rows: Row[]; scope: "pc" | "pw" }) {
  return (
    <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nomor Tiket</th>
              <th className="px-4 py-3 font-medium">Organisasi</th>
              <th className="px-4 py-3 font-medium">Tipe</th>
              <th className="px-4 py-3 font-medium">Sumber ST</th>
              <th className="px-4 py-3 font-medium">Administrator</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Tanggal</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-center">Revisi</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ticketId} className="border-t border-border hover:bg-primary/5 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap">{r.ticketId}</td>
                <td className="px-4 py-3 text-foreground max-w-[260px]">
                  <span className="line-clamp-1">{r.namaOrg}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.tipeOrg}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{sumberLabel(r.sumberSuratTugas)}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-[180px]"><span className="line-clamp-1">{r.namaAdmin}</span></td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{fmtDate(r.submittedAt)}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-center text-muted-foreground">{r.revisionCount ?? 0}</td>
                <td className="px-4 py-3">
                  <RowActions row={r} scope={scope} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MobileList({ rows, scope }: { rows: Row[]; scope: "pc" | "pw" }) {
  return (
    <div className="md:hidden space-y-3">
      {rows.map((r) => (
        <div key={r.ticketId} className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-foreground line-clamp-2">{r.namaOrg}</p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">{r.ticketId}</p>
            </div>
            <StatusBadge status={r.status} />
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <div><span className="text-foreground/70">Tipe:</span> {r.tipeOrg}</div>
            <div><span className="text-foreground/70">Tgl:</span> {fmtDate(r.submittedAt)}</div>
            <div className="col-span-2"><span className="text-foreground/70">Admin:</span> {r.namaAdmin}</div>
            <div className="col-span-2"><span className="text-foreground/70">Sumber ST:</span> {sumberLabel(r.sumberSuratTugas)}</div>
            {(r.revisionCount ?? 0) > 0 && (
              <div className="col-span-2"><span className="text-foreground/70">Revisi:</span> {r.revisionCount}</div>
            )}
          </div>
          <div className="pt-1">
            <RowActions row={r} scope={scope} mobile />
          </div>
        </div>
      ))}
    </div>
  );
}

function RowActions({ row, scope, mobile }: { row: Row; scope: "pc" | "pw"; mobile?: boolean }) {
  const detailTo = scope === "pc" ? "/pc/status-pengajuan/$ticketId" : "/pw/status-pengajuan/$ticketId";
  const revisiTo =
    scope === "pc" ? "/pc/status-pengajuan/$ticketId/revisi" : "/pw/status-pengajuan/$ticketId/revisi";

  return (
    <div className={mobile ? "grid grid-cols-2 gap-2" : "flex items-center justify-end gap-2 whitespace-nowrap"}>
      <Link
        to={detailTo}
        params={{ ticketId: row.ticketId }}
        className={
          mobile
            ? "inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
            : "inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
        }
      >
        Detail
      </Link>
      {row.status === "PerluPerbaikan" && (
        <Link
          to={revisiTo}
          params={{ ticketId: row.ticketId }}
          className={
            mobile
              ? "inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              : "inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          }
        >
          Perbaiki
        </Link>
      )}
      <WhatsAppButton phone={row.hp} ticketId={row.ticketId} iconOnly size="sm" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <Inbox className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground">Belum ada pengajuan</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Pengajuan MWC, Lembaga PC, atau Ranting yang Anda kirim akan muncul di sini.
      </p>
      <Link
        to="/pc/daftarkan"
        className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Daftarkan Organisasi Bawahan
      </Link>
    </div>
  );
}
