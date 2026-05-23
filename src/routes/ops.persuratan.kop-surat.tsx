import { createFileRoute } from "@tanstack/react-router";
import { OpsPlaceholder } from "@/components/ops/OpsPlaceholder";

export const Route = createFileRoute("/ops/persuratan/kop-surat")({
  component: () => (
    <OpsPlaceholder
      title="Kop Surat"
      subtitle="Pengelolaan template kop surat untuk persuratan."
      breadcrumb={[{ label: "Persuratan" }, { label: "Kop Surat" }]}
      searchPlaceholder="Cari template kop surat…"
    />
  ),
});
