import { createFileRoute } from "@tanstack/react-router";
import { OpsPlaceholder } from "@/components/ops/OpsPlaceholder";
export const Route = createFileRoute("/ops/correspondence/revert-letter-stamp")({
  component: () => <OpsPlaceholder title="Cek Order ID" subtitle="Tracking dan verifikasi order persuratan." breadcrumb={[{ label: "Persuratan" }, { label: "Cek Order ID" }]} searchPlaceholder="Masukkan Order ID…" />,
});
