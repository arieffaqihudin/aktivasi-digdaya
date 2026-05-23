import { createFileRoute, Link } from "@tanstack/react-router";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { ArrowRight, KeyRound, Inbox, FileDown, Settings, ScrollText, LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/ops/")({
  component: OpsHome,
});

const tiles = [
  { to: "/ops/activation", label: "Overview Aktivasi", desc: "Ringkasan kode akses & pengajuan aktivasi.", icon: LayoutDashboard },
  { to: "/ops/activation/access-codes", label: "Kode Akses", desc: "Generate & kelola kode akses aktivasi.", icon: KeyRound },
  { to: "/ops/activation/submissions", label: "Pengajuan Aktivasi", desc: "Pantauan seluruh pengajuan PW/PC.", icon: Inbox },
  { to: "/ops/activation/peruri-export", label: "Export Peruri", desc: "Batch ekspor data approved ke Peruri.", icon: FileDown },
  { to: "/ops/activation/settings", label: "Pengaturan", desc: "Konfigurasi modul aktivasi.", icon: Settings },
  { to: "/ops/activation/audit-log", label: "Audit Log", desc: "Riwayat aktivitas operator.", icon: ScrollText },
];

function OpsHome() {
  return (
    <div>
      <OpsPageHeader title="Selamat datang di Digdaya Ops" subtitle="Kelola kebutuhan operasional Digdaya dari satu tempat." breadcrumb={[{ label: "Beranda" }]} />
      <OpsPageBody>
        <OpsCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tiles.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="group flex items-start gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/[0.08] text-primary">
                  <t.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-foreground">{t.label}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground line-clamp-2">{t.desc}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-primary">
                    Buka <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </OpsCard>
      </OpsPageBody>
    </div>
  );
}
