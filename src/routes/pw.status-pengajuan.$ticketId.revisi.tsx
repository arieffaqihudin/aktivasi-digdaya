import { createFileRoute } from "@tanstack/react-router";
import { InternalRevisionForm } from "@/components/internal/InternalRevisionForm";

export const Route = createFileRoute("/pw/status-pengajuan/$ticketId/revisi")({
  component: PwRevisi,
});

function PwRevisi() {
  const { ticketId } = Route.useParams();
  return <InternalRevisionForm ticketId={ticketId} scope="pw" />;
}
