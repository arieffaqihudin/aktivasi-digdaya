import { createFileRoute } from "@tanstack/react-router";
import { OpsPlaceholder } from "@/components/ops/OpsPlaceholder";

export const Route = createFileRoute("/ops/persuratan/stamper")({
  component: () => (
    <OpsPlaceholder
      title="Stamper"
      subtitle="Tools stamper digital untuk dokumen persuratan."
      breadcrumb={[{ label: "Persuratan" }, { label: "Stamper" }]}
      searchPlaceholder="Cari dokumen…"
    />
  ),
});
