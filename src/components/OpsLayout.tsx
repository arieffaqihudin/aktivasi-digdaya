import { AppLayout, type MenuItem } from "./AppLayout";
import {
  Home,
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
  Users,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { effectivePermissions, type PermissionKey } from "@/data/usersData";

type OpsMenuItem = MenuItem & { permission?: PermissionKey };

const opsMenuAll: OpsMenuItem[] = [
  { to: "/ops", label: "Overview", icon: Home, exact: true, section: "OVERVIEW", permission: "overview" },

  { to: "/ops/persuratan/pengajuan-ubah-email", label: "Pengajuan Ubah Email", icon: Mail, section: "PERSURATAN", permission: "persuratan.change_email" },
  { to: "/ops/persuratan/cek-order-id", label: "Cek Order ID", icon: Search, section: "PERSURATAN", permission: "persuratan.check_order_id" },
  { to: "/ops/persuratan/kop-surat", label: "Kop Surat", icon: FileText, section: "PERSURATAN", permission: "persuratan.kop_surat" },
  { to: "/ops/persuratan/stamper", label: "Stamper", icon: Stamp, section: "PERSURATAN", permission: "persuratan.stamper" },

  { to: "/ops/activation/access-codes", label: "Kode Akses", icon: KeyRound, section: "PORTAL AKTIVASI", permission: "activation.access_codes" },
  { to: "/ops/activation/submissions", label: "Pengajuan Aktivasi", icon: Inbox, section: "PORTAL AKTIVASI", permission: "activation.submissions" },
  { to: "/ops/activation/peruri-export", label: "Export Peruri", icon: FileDown, section: "PORTAL AKTIVASI", permission: "activation.peruri_export" },
  { to: "/ops/activation/settings", label: "Pengaturan Aktivasi", icon: Settings, section: "PORTAL AKTIVASI", permission: "activation.settings" },
  { to: "/ops/activation/audit-log", label: "Audit Log Aktivasi", icon: ScrollText, section: "PORTAL AKTIVASI", permission: "activation.audit_log" },

  { to: "/ops/users", label: "Pengguna", icon: Users, section: "MANAJEMEN AKSES", permission: "access.users" },
  { to: "/ops/roles", label: "Hak Akses", icon: ShieldCheck, section: "MANAJEMEN AKSES", permission: "access.roles" },

  { to: "/ops/repository", label: "Repository", icon: FolderArchive, section: "REPOSITORY", permission: "repository" },
];

export function OpsLayout() {
  const user = useStore((s) => s.user);
  const users = useStore((s) => s.users);
  const roles = useStore((s) => s.roles);

  // Find the matching UserAccount for the logged-in user (by email).
  // If found, filter the sidebar by their effective permissions.
  // Super Admin (or unknown) sees everything.
  let menu: MenuItem[] = opsMenuAll;
  if (user && user.role !== "Super Admin") {
    const account = users.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (account) {
      const perms = new Set(effectivePermissions(account, roles));
      menu = opsMenuAll.filter((m) => !m.permission || perms.has(m.permission));
    }
  }

  return (
    <AppLayout
      scopeLabel="Digdaya Ops"
      orgName="Digdaya Ops"
      allowedRoles={["Super Admin"]}
      menu={menu}
    />
  );
}
