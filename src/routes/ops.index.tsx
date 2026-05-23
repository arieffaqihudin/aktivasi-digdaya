import { createFileRoute, Link } from "@tanstack/react-router";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { ArrowRight, LayoutDashboard, Mail, Search, FileText, Stamp, FolderArchive } from "lucide-react";

export const Route = createFileRoute("/ops/")({
  component: OpsHome,
});

const tiles = [
  { to: "/ops/activation", label: "Portal Aktivasi", desc: "Modul aktivasi PW/PC: kode akses, pengajuan, export Peruri.", icon: LayoutDashboard },
  { to: "/ops/persuratan/pengajuan-ubah-email", label: "Pengajuan Ubah Email", desc: "Kelola pengajuan perubahan email pengguna.", icon: Mail },
  { to: "/ops/persuratan/cek-order-id", label: "Cek Order ID", desc: "Pengecekan order ID persuratan.", icon: Search },
  { to: "/ops/persuratan/kop-surat", label: "Kop Surat", desc: "Template & pengelolaan kop surat.", icon: FileText },
  { to: "/ops/persuratan/stamper", label: "Stamper", desc: "Tools stamper digital untuk dokumen.", icon: Stamp },
  { to: "/ops/repository", label: "Repository", desc: "Repository dokumen dan arsip.", icon: FolderArchive },
] as const;

function OpsHome() {
  return (
    <div>
      <OpsPageHeader title="Digdaya Ops" subtitle="Pusat operasional untuk pengelolaan layanan Digdaya." breadcrumb={[{ label: "Beranda" }]} />
      <OpsPageBody>
        <OpsCard title="Akses cepat" description="Buka modul operasional Digdaya.">
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
