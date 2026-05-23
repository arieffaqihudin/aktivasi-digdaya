import { AppLayout, type MenuItem } from "./AppLayout";
import {
  Home,
  Mail,
  Search,
  FileText,
  Stamp,
  LayoutDashboard,
  KeyRound,
  Inbox,
  FileDown,
  Settings,
  ScrollText,
  Database,
} from "lucide-react";

/**
 * Sidebar groups for the Digdaya Ops shell. The Aktivasi Digdaya module
 * lives here together with placeholder entries for the existing Ops modules
 * (Persuratan, Repository) so it feels like part of the same product.
 */
const opsMenu: MenuItem[] = [
  // BERANDA
  { to: "/ops", label: "Beranda", icon: Home, exact: true, section: "BERANDA" },

  // PERSURATAN (placeholder existing Ops modules)
  { to: "/ops/correspondence/change-email", label: "Pengajuan Ubah Email", icon: Mail, section: "PERSURATAN" },
  { to: "/ops/correspondence/revert-letter-stamp", label: "Cek Order ID", icon: Search, section: "PERSURATAN" },
  { to: "/ops/correspondence/letterhead", label: "Kop Surat", icon: FileText, section: "PERSURATAN" },
  { to: "/ops/correspondence/stamper", label: "Stamper", icon: Stamp, section: "PERSURATAN" },

  // AKTIVASI DIGDAYA
  { to: "/ops/activation", label: "Overview Aktivasi", icon: LayoutDashboard, exact: true, section: "AKTIVASI DIGDAYA" },
  { to: "/ops/activation/access-codes", label: "Kode Akses", icon: KeyRound, section: "AKTIVASI DIGDAYA" },
  { to: "/ops/activation/submissions", label: "Pengajuan Aktivasi", icon: Inbox, section: "AKTIVASI DIGDAYA" },
  { to: "/ops/activation/peruri-export", label: "Export Peruri", icon: FileDown, section: "AKTIVASI DIGDAYA" },
  { to: "/ops/activation/settings", label: "Pengaturan Aktivasi", icon: Settings, section: "AKTIVASI DIGDAYA" },
  { to: "/ops/activation/audit-log", label: "Audit Log Aktivasi", icon: ScrollText, section: "AKTIVASI DIGDAYA" },

  // REPOSITORY
  { to: "/ops/repository", label: "Repository", icon: Database, section: "REPOSITORY" },
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
