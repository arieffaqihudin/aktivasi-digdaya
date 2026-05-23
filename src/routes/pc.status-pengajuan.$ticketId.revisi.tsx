import { createFileRoute } from "@tanstack/react-router";
import { InternalRevisionForm } from "@/components/internal/InternalRevisionForm";

export const Route = createFileRoute("/pc/status-pengajuan/$ticketId/revisi")({
  component: PcRevisi,
});

function PcRevisi() {
  const { ticketId } = Route.useParams();
  return <InternalRevisionForm ticketId={ticketId} scope="pc" />;
}
