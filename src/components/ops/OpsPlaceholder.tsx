import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Construction } from "lucide-react";
import type { Crumb } from "@/components/ops/OpsPageHeader";

export function OpsPlaceholder({ title, subtitle, breadcrumb, searchPlaceholder = "Cari…" }: { title: string; subtitle?: string; breadcrumb: Crumb[]; searchPlaceholder?: string }) {
  return (
    <div>
      <OpsPageHeader title={title} subtitle={subtitle} breadcrumb={breadcrumb} />
      <OpsPageBody>
        <OpsCard
          title={title}
          description="Modul ini akan segera tersedia di Digdaya Ops."
          action={<Button size="sm" disabled>Aksi Utama</Button>}
        >
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:flex-1 sm:min-w-[240px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={searchPlaceholder} disabled className="h-10 w-full pl-9" />
            </div>
          </div>
        </OpsCard>
        <OpsCard>
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
              <Construction className="h-6 w-6" />
            </span>
            <p className="text-[14px] font-semibold text-foreground">Modul dalam pengembangan</p>
            <p className="max-w-md text-[12.5px] text-muted-foreground">Halaman ini adalah placeholder untuk modul existing Digdaya Ops. Fokus prototipe saat ini ada pada modul Aktivasi Digdaya.</p>
          </div>
        </OpsCard>
      </OpsPageBody>
    </div>
  );
}
