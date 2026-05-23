import { createFileRoute } from "@tanstack/react-router";
import { InternalStatusDetail } from "@/components/internal/InternalStatusDetail";

export const Route = createFileRoute("/pc/status-pengajuan/$ticketId")({
  component: PcDetail,
});

function PcDetail() {
  const { ticketId } = Route.useParams();
  return <InternalStatusDetail ticketId={ticketId} scope="pc" />;
}
