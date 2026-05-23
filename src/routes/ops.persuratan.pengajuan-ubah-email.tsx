import { createFileRoute } from "@tanstack/react-router";
import { OpsPlaceholder } from "@/components/ops/OpsPlaceholder";

export const Route = createFileRoute("/ops/persuratan/pengajuan-ubah-email")({
  component: () => (
    <OpsPlaceholder
      title="Pengajuan Ubah Email"
      subtitle="Halaman operasional untuk pengajuan perubahan email pengguna."
      breadcrumb={[{ label: "Persuratan" }, { label: "Pengajuan Ubah Email" }]}
      searchPlaceholder="Cari pengajuan…"
    />
  ),
});
