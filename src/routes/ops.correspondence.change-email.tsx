import { createFileRoute } from "@tanstack/react-router";
import { OpsPlaceholder } from "@/components/ops/OpsPlaceholder";
export const Route = createFileRoute("/ops/correspondence/change-email")({
  component: () => <OpsPlaceholder title="Pengajuan Ubah Email" subtitle="Verifikasi dan proses pengajuan perubahan email pengurus." breadcrumb={[{ label: "Persuratan" }, { label: "Pengajuan Ubah Email" }]} searchPlaceholder="Cari pengajuan…" />,
});
