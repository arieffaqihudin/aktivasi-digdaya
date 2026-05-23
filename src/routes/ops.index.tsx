import { createFileRoute, Link } from "@tanstack/react-router";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { ArrowRight, KeyRound, Mail, Search, Stamp, Database, LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/ops/")({
  component: OpsHome,
});

const tiles = [
  { to: "/ops/activation", label: "Aktivasi Digdaya", desc: "Kelola kode akses & pengajuan aktivasi PW/PC.", icon: LayoutDashboard },
  { to: "/ops/correspondence/change-email", label: "Pengajuan Ubah Email", desc: "Verifikasi perubahan email pengurus.", icon: Mail },
  { to: "/ops/correspondence/revert-letter-stamp", label: "Cek Order ID", desc: "Tracking order persuratan.", icon: Search },
  { to: "/ops/correspondence/stamper", label: "Stamper", desc: "Kelola stempel digital.", icon: Stamp },
  { to: "/ops/repository", label: "Repository", desc: "Arsip dokumen Digdaya.", icon: Database },
  { to: "/ops/activation/access-codes", label: "Generate Kode Akses", desc: "Buat batch kode akses aktivasi.", icon: KeyRound },
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
