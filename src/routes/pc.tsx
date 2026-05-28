import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { LayoutDashboard, PlusCircle, ListChecks } from "lucide-react";
import { actions, useStore } from "@/lib/store";
import { useEffect } from "react";

export const Route = createFileRoute("/pc")({
  component: PcLayout,
});

function PcLayout() {
  const user = useStore((s) => s.user);

  useEffect(() => {
    if (!user) actions.loginAs("pc.kraksaan@digdaya.nu.id");
  }, [user]);

  return (
    <AppLayout
      scopeLabel="Dashboard PC Aktif"
      allowedRoles={["PC"]}
      menu={[
        { to: "/pc", label: "Overview", icon: LayoutDashboard, exact: true, section: "Beranda" },
        { to: "/pc/daftarkan", label: "Daftarkan Organisasi Bawahan", icon: PlusCircle, section: "Aktivasi Organisasi" },
        { to: "/pc/status-pengajuan", label: "Status Pengajuan", icon: ListChecks, section: "Aktivasi Organisasi" },
      ]}
    />
  );
}
