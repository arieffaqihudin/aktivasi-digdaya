import { createFileRoute } from "@tanstack/react-router";
import { InternalStatusDetail } from "@/components/internal/InternalStatusDetail";

export const Route = createFileRoute("/pw/status-pengajuan/$ticketId")({
  component: PwDetail,
});

function PwDetail() {
  const { ticketId } = Route.useParams();
  return <InternalStatusDetail ticketId={ticketId} scope="pw" />;
}
