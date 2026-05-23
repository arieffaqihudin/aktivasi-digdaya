import { AppLayout, type MenuItem } from "./AppLayout";
import {
  Home,
  LayoutDashboard,
  KeyRound,
  Inbox,
  FileDown,
  Settings,
  ScrollText,
} from "lucide-react";

/**
 * Sidebar groups for the Digdaya Ops shell. Trimmed to focus on the
 * Aktivasi Digdaya module — non-functional Persuratan/Repository entries
 * were removed to keep the demo clean.
 */
const opsMenu: MenuItem[] = [
  { to: "/ops", label: "Beranda", icon: Home, exact: true, section: "BERANDA" },

  { to: "/ops/activation", label: "Overview Aktivasi", icon: LayoutDashboard, exact: true, section: "AKTIVASI DIGDAYA" },
  { to: "/ops/activation/access-codes", label: "Kode Akses", icon: KeyRound, section: "AKTIVASI DIGDAYA" },
  { to: "/ops/activation/submissions", label: "Pengajuan Aktivasi", icon: Inbox, section: "AKTIVASI DIGDAYA" },
  { to: "/ops/activation/peruri-export", label: "Export Peruri", icon: FileDown, section: "AKTIVASI DIGDAYA" },
  { to: "/ops/activation/settings", label: "Pengaturan", icon: Settings, section: "AKTIVASI DIGDAYA" },
  { to: "/ops/activation/audit-log", label: "Audit Log", icon: ScrollText, section: "AKTIVASI DIGDAYA" },
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
