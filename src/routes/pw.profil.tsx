import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useStore } from "@/lib/store";
import { masterPW } from "@/data/mockData";

export const Route = createFileRoute("/pw/profil")({
  component: Profil,
});

function Profil() {
  const user = useStore((s) => s.user);
  const pw = masterPW.find((p) => p.id === user?.pwId);
  return (
    <div>
      <PageHeader title="Profil PW" subtitle="Data PW sumber pendaftaran internal." />
      <div className="p-6">
        <div className="max-w-xl space-y-3 rounded-xl border border-border bg-card p-5">
          <Row label="Nama PW" value={pw?.nama ?? "—"} />
          <Row label="Wilayah" value={pw?.wilayah ?? "—"} />
          <Row label="Status Organisasi" value={pw?.statusOrg ?? "—"} />
          <Row label="Email Administrator" value={user?.email ?? "—"} />
        </div>
      </div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border pb-2 last:border-0">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
