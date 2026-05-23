import { createFileRoute } from "@tanstack/react-router";
import { OpsLayout } from "@/components/OpsLayout";

export const Route = createFileRoute("/ops")({
  component: OpsLayout,
});
