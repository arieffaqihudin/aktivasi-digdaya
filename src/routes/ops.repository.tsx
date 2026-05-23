import { createFileRoute } from "@tanstack/react-router";
import { OpsPlaceholder } from "@/components/ops/OpsPlaceholder";

export const Route = createFileRoute("/ops/repository")({
  component: () => (
    <OpsPlaceholder
      title="Repository"
      subtitle="Repository dokumen dan arsip Digdaya Ops."
      breadcrumb={[{ label: "Repository" }]}
      searchPlaceholder="Cari berkas…"
    />
  ),
});
