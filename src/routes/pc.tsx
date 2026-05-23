import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { LayoutDashboard, PlusCircle, ListChecks, User } from "lucide-react";

export const Route = createFileRoute("/pc")({
  component: PcLayout,
});

function PcLayout() {
  return (
    <AppLayout
      scopeLabel="Dashboard PC Aktif"
      allowedRoles={["PC"]}
      menu={[
        { to: "/pc", label: "Overview", icon: LayoutDashboard, exact: true, section: "Dashboard" },
        { to: "/pc/daftarkan", label: "Daftarkan Organisasi Bawahan", icon: PlusCircle, section: "Aktivasi Organisasi" },
        { to: "/pc/status-pengajuan", label: "Status Pengajuan", icon: ListChecks, section: "Aktivasi Organisasi" },
        { to: "/pc/profil", label: "Profil PC", icon: User, section: "Pengaturan" },
      ]}
    />
  );
}
