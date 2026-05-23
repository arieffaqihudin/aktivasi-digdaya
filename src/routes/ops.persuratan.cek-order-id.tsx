import { createFileRoute } from "@tanstack/react-router";
import { OpsPlaceholder } from "@/components/ops/OpsPlaceholder";

export const Route = createFileRoute("/ops/persuratan/cek-order-id")({
  component: () => (
    <OpsPlaceholder
      title="Cek Order ID"
      subtitle="Halaman operasional untuk pengecekan order ID persuratan."
      breadcrumb={[{ label: "Persuratan" }, { label: "Cek Order ID" }]}
      searchPlaceholder="Masukkan Order ID…"
    />
  ),
});
