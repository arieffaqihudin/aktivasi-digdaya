import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { LayoutDashboard, PlusCircle, ListChecks } from "lucide-react";
import { actions, useStore } from "@/lib/store";

export const Route = createFileRoute("/pw")({
  component: PwLayout,
});

function PwLayout() {
  const user = useStore((s) => s.user);

  if (!user) {
    actions.loginAs("pw@digdaya.nu.id");
  }

  return (
    <AppLayout
      scopeLabel="Dashboard PW Aktif"
      allowedRoles={["PW"]}
      menu={[
        { to: "/pw", label: "Overview", icon: LayoutDashboard, exact: true, section: "Beranda" },
        { to: "/pw/daftarkan", label: "Daftarkan Organisasi Bawahan", icon: PlusCircle, section: "Aktivasi Organisasi" },
        { to: "/pw/status-pengajuan", label: "Status Pengajuan", icon: ListChecks, section: "Aktivasi Organisasi" },
      ]}
    />
  );
}
