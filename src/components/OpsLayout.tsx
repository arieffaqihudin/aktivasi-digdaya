import { AppLayout, type MenuItem } from "./AppLayout";
import {
  Home,
  LayoutDashboard,
  KeyRound,
  Inbox,
  FileDown,
  Settings,
  ScrollText,
  Mail,
  Search,
  FileText,
  Stamp,
  FolderArchive,
} from "lucide-react";

/**
 * Sidebar Digdaya Ops — existing modules (Persuratan, Repository) plus
 * the new Portal Aktivasi module grouped as its own section.
 */
const opsMenu: MenuItem[] = [
  { to: "/ops", label: "Beranda", icon: Home, exact: true, section: "BERANDA" },

  { to: "/ops/persuratan/pengajuan-ubah-email", label: "Pengajuan Ubah Email", icon: Mail, section: "PERSURATAN" },
  { to: "/ops/persuratan/cek-order-id", label: "Cek Order ID", icon: Search, section: "PERSURATAN" },
  { to: "/ops/persuratan/kop-surat", label: "Kop Surat", icon: FileText, section: "PERSURATAN" },
  { to: "/ops/persuratan/stamper", label: "Stamper", icon: Stamp, section: "PERSURATAN" },

  { to: "/ops/activation", label: "Overview Aktivasi", icon: LayoutDashboard, exact: true, section: "PORTAL AKTIVASI" },
  { to: "/ops/activation/access-codes", label: "Kode Akses", icon: KeyRound, section: "PORTAL AKTIVASI" },
  { to: "/ops/activation/submissions", label: "Pengajuan Aktivasi", icon: Inbox, section: "PORTAL AKTIVASI" },
  { to: "/ops/activation/peruri-export", label: "Export Peruri", icon: FileDown, section: "PORTAL AKTIVASI" },
  { to: "/ops/activation/settings", label: "Pengaturan Aktivasi", icon: Settings, section: "PORTAL AKTIVASI" },
  { to: "/ops/activation/audit-log", label: "Audit Log Aktivasi", icon: ScrollText, section: "PORTAL AKTIVASI" },

  { to: "/ops/repository", label: "Repository", icon: FolderArchive, section: "REPOSITORY" },
];

export function OpsLayout() {
  return (
    <AppLayout
      scopeLabel="Digdaya Ops"
      orgName="Digdaya Ops"
      allowedRoles={["Super Admin"]}
      menu={opsMenu}
    />
  );
}
