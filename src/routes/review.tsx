import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { LayoutDashboard, Inbox, FileDown, Timer, ScrollText } from "lucide-react";

export const Route = createFileRoute("/review")({
  component: ReviewLayout,
});

function ReviewLayout() {
  return (
    <AppLayout
      scopeLabel="Reviewer Tim Digdaya"
      allowedRoles={["Reviewer", "Super Admin"]}
      menu={[
        { to: "/review", label: "Ringkasan", icon: LayoutDashboard, exact: true },
        { to: "/review/inbox", label: "Inbox Pendaftaran", icon: Inbox },
        { to: "/review/peruri", label: "Export Peruri", icon: FileDown },
        { to: "/review/sla", label: "SLA Monitoring", icon: Timer },
        { to: "/review/audit-log", label: "Audit Log", icon: ScrollText },
      ]}
    />
  );
}
