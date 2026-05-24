import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pc/status-pengajuan/")({
  component: StatusPengajuan,
});

type TypeFilter = "ALL" | "MWC" | "Lembaga PC" | "Ranting";

function StatusPengajuan() {
  const registrations = useStore((s) => s.registrations);
  const [filter, setFilter] = useState<TypeFilter>("ALL");

  const regs = useMemo(
    () => registrations.filter((r) => r.sumberPengajuan === "PC_DASHBOARD"),
    [registrations],
  );

  const filtered = useMemo(
    () => (filter === "ALL" ? regs : regs.filter((r) => r.tipeOrg === filter)),
    [regs, filter],
  );

  const counts: Record<TypeFilter, number> = {
    ALL: regs.length,
    MWC: regs.filter((r) => r.tipeOrg === "MWC").length,
    "Lembaga PC": regs.filter((r) => r.tipeOrg === "Lembaga PC").length,
    Ranting: regs.filter((r) => r.tipeOrg === "Ranting").length,
  };

  const filterOptions: TypeFilter[] = ["ALL", "MWC", "Lembaga PC", "Ranting"];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Status Pengajuan</h1>
            <p className="text-sm text-muted-foreground">Semua pengajuan dari dashboard PC.</p>
          </div>
          <Link to="/pc/daftarkan" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Daftarkan Organisasi
          </Link>
        </div>

        {/* Filter chips */}
        <div className="-mx-1 flex w-full overflow-x-auto">
          <div className="inline-flex w-max gap-2 px-1">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFilter(opt)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors",
                  filter === opt
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {opt === "ALL" ? "Semua" : opt} <span className="ml-1 text-[11px] opacity-75">({counts[opt]})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              {filter === "ALL"
                ? "Belum ada pengajuan."
                : `Belum ada pengajuan ${filter}.`}
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.ticketId} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{item.namaOrg}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.ticketId} · {item.tipeOrg}
                      {item.tipeOrg === "Ranting" && item.parentMwcName && (
                        <> · Induk: {item.parentMwcName}</>
                      )}
                    </p>
                    <div className="mt-2"><StatusBadge status={item.status} /></div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                    <Link to="/pc/status-pengajuan/$ticketId" params={{ ticketId: item.ticketId }} className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground">
                      Detail
                    </Link>
                    {item.status === "PerluPerbaikan" && (
                      <Link to="/pc/status-pengajuan/$ticketId/revisi" params={{ ticketId: item.ticketId }} className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                        Perbaiki
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
