import { createFileRoute } from "@tanstack/react-router";
import { OpsPlaceholder } from "@/components/ops/OpsPlaceholder";
export const Route = createFileRoute("/ops/repository")({
  component: () => <OpsPlaceholder title="Repository" subtitle="Arsip dokumen Digdaya yang dapat dicari dan diunduh." breadcrumb={[{ label: "Repository" }]} searchPlaceholder="Cari dokumen…" />,
});
