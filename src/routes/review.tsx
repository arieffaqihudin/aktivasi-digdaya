import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { LayoutDashboard, Inbox, FileDown, ScrollText } from "lucide-react";

export const Route = createFileRoute("/review")({
  component: ReviewLayout,
});

function ReviewLayout() {
  return (
    <AppLayout
      scopeLabel="Reviewer Tim Digdaya"
      orgName="Tim Digdaya PBNU"
      allowedRoles={["Reviewer", "Super Admin"]}
      menu={[
        { to: "/review", label: "Ringkasan", icon: LayoutDashboard, exact: true, section: "Dashboard" },
        { to: "/review/inbox", label: "Inbox Pendaftaran", icon: Inbox, section: "Review" },
        { to: "/review/peruri", label: "Export Peruri", icon: FileDown, section: "Review" },
        { to: "/review/audit-log", label: "Audit Log", icon: ScrollText, section: "Monitoring" },
      ]}
    />
  );
}
