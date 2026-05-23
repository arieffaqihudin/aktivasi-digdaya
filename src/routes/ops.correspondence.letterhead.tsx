import { createFileRoute } from "@tanstack/react-router";
import { OpsPlaceholder } from "@/components/ops/OpsPlaceholder";
export const Route = createFileRoute("/ops/correspondence/letterhead")({
  component: () => <OpsPlaceholder title="Kop Surat" subtitle="Kelola template kop surat untuk seluruh kepengurusan." breadcrumb={[{ label: "Persuratan" }, { label: "Kop Surat" }]} searchPlaceholder="Cari kop surat…" />,
});
