import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { LayoutDashboard, PlusCircle, ListChecks, User, FileText } from "lucide-react";

export const Route = createFileRoute("/pw")({
  component: PwLayout,
});

function PwLayout() {
  return (
    <AppLayout
      scopeLabel="Dashboard PW Aktif"
      allowedRoles={["PW"]}
      menu={[
        { to: "/pw", label: "Overview", icon: LayoutDashboard, exact: true, section: "Beranda" },
        { to: "/pw/daftarkan", label: "Daftarkan Organisasi Bawahan", icon: PlusCircle, section: "Aktivasi Organisasi" },
        { to: "/pw/status-pengajuan", label: "Status Pengajuan", icon: ListChecks, section: "Aktivasi Organisasi" },
        { to: "/pw/surat-tugas", label: "Surat Tugas dari Persuratan", icon: FileText, section: "Dokumen" },
        { to: "/pw/profil", label: "Profil PW", icon: User, section: "Akun" },
      ]}
    />
  );
}
