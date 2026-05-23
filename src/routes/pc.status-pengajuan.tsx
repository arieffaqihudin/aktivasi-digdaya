import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/pc/status-pengajuan")({
  component: StatusPengajuan,
});

function StatusPengajuan() {
  const registrations = useStore((s) => s.registrations);
  const regs = useMemo(
    () => registrations.filter((r) => r.sumberPengajuan === "PC_DASHBOARD"),
    [registrations],
  );

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

        <div className="space-y-3">
          {regs.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">Belum ada pengajuan.</div>
          ) : (
            regs.map((item) => (
              <div key={item.ticketId} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.namaOrg}</p>
                    <p className="text-sm text-muted-foreground">{item.ticketId} · {item.tipeOrg} · {item.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/pc/status-pengajuan/$ticketId" params={{ ticketId: item.ticketId }} className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground">
                      Detail
                    </Link>
                    {item.status === "PerluPerbaikan" && (
                      <Link to="/pc/status-pengajuan/$ticketId/revisi" params={{ ticketId: item.ticketId }} className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                        Revisi
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
