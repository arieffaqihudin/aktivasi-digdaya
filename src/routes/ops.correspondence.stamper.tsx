import { createFileRoute } from "@tanstack/react-router";
import { OpsPlaceholder } from "@/components/ops/OpsPlaceholder";
export const Route = createFileRoute("/ops/correspondence/stamper")({
  component: () => <OpsPlaceholder title="Stamper" subtitle="Kelola stempel digital untuk persuratan." breadcrumb={[{ label: "Persuratan" }, { label: "Stamper" }]} searchPlaceholder="Cari stempel…" />,
});
