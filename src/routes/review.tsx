import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Home, Inbox, FileDown, ScrollText } from "lucide-react";

export const Route = createFileRoute("/review")({
  component: ReviewLayout,
});

function ReviewLayout() {
  return (
    <AppLayout
      scopeLabel="Digdaya Ops"
      orgName="Digdaya Ops"
      allowedRoles={["Reviewer", "Super Admin"]}
      menu={[
        { to: "/review", label: "Overview", icon: Home, exact: true, section: "OVERVIEW" },
        { to: "/review/inbox", label: "Pengajuan Aktivasi", icon: Inbox, section: "PORTAL AKTIVASI" },
        { to: "/review/peruri", label: "Export Peruri", icon: FileDown, section: "PORTAL AKTIVASI" },
        { to: "/review/audit-log", label: "Audit Log Aktivasi", icon: ScrollText, section: "PORTAL AKTIVASI" },
      ]}
    />
  );
}
