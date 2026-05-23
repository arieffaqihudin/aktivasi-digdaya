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
      orgName="Pengurus Besar Nahdlatul Ulama"
      allowedRoles={["Super Admin"]}
      menu={[
        { to: "/admin", label: "Overview Nasional", icon: LayoutDashboard, exact: true, section: "Dashboard" },
        { to: "/admin/access-codes", label: "Kode Akses PC", icon: KeyRound, section: "Aktivasi" },
        { to: "/review/inbox", label: "Inbox Pendaftaran", icon: Inbox, section: "Aktivasi" },
        { to: "/review/peruri", label: "Export Peruri", icon: FileDown, section: "Aktivasi" },
        { to: "/admin/audit-log", label: "Audit Log", icon: ScrollText, section: "Sistem" },
        { to: "/admin/settings", label: "Konfigurasi", icon: Settings, section: "Sistem" },
      ]}
    />
  );
}
