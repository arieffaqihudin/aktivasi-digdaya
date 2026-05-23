import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useStore } from "@/lib/store";
import { masterPC } from "@/data/mockData";

export const Route = createFileRoute("/pc/profil")({
  component: Profil,
});

function Profil() {
  const user = useStore((s) => s.user);
  const pc = masterPC.find((p) => p.id === user?.pcId);
  return (
    <div>
      <PageHeader title="Profil PC" subtitle="Data PC sumber pendaftaran Jalur B." />
      <div className="p-6">
        <div className="max-w-xl space-y-3 rounded-xl border border-border bg-card p-5">
          <Row label="Nama PC" value={pc?.nama ?? "—"} />
          <Row label="Wilayah PW" value={pc?.pw ?? "—"} />
          <Row label="Status" value="Aktif" />
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
