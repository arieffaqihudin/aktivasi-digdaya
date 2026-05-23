import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { LayoutDashboard, KeyRound, ScrollText, Settings, Inbox, FileDown } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AppLayout
      scopeLabel="Super Admin PBNU"
      allowedRoles={["Super Admin"]}
      menu={[
        { to: "/admin", label: "Overview Nasional", icon: LayoutDashboard, exact: true },
        { to: "/admin/access-codes", label: "Kode Akses PC", icon: KeyRound },
        { to: "/review/inbox", label: "Inbox Pendaftaran", icon: Inbox },
        { to: "/review/peruri", label: "Export Peruri", icon: FileDown },
        { to: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
        { to: "/admin/settings", label: "Konfigurasi", icon: Settings },
      ]}
    />
  );
}
