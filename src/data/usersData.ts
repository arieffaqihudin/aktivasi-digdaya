// ============================================================
// Master Data Pengguna & Hak Akses
// ============================================================

export type PermissionKey =
  | "overview"
  | "persuratan.change_email"
  | "persuratan.check_order_id"
  | "persuratan.kop_surat"
  | "persuratan.stamper"
  | "activation.access_codes"
  | "activation.submissions"
  | "activation.peruri_export"
  | "activation.settings"
  | "activation.audit_log"
  | "access.users"
  | "access.roles"
  | "repository";

export type UserStatus = "Aktif" | "Nonaktif" | "Menunggu Aktivasi";

export type OrgLevel = "PB" | "PW" | "PC" | "MWC" | "Ranting" | "Lembaga";

export type RoleName =
  | "Super Admin"
  | "Reviewer Aktivasi"
  | "Admin Ops Persuratan"
  | "Admin PW"
  | "Admin PC";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: RoleName;
  orgName: string;
  orgLevel: OrgLevel;
  parentOrgName?: string;
  status: UserStatus;
  lastLoginAt?: string;
  /** Optional override; if undefined uses role preset */
  permissions?: PermissionKey[];
  createdAt: string;
}

export interface RoleDef {
  id: string;
  name: RoleName;
  description: string;
  /** Empty array = no Ops sidebar access (uses dashboard PW/PC instead) */
  permissions: PermissionKey[];
  /** Helper label for the Akses Utama column */
  primaryAccess: string;
}

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  overview: "Overview",
  "persuratan.change_email": "Pengajuan Ubah Email",
  "persuratan.check_order_id": "Cek Order ID",
  "persuratan.kop_surat": "Kop Surat",
  "persuratan.stamper": "Stamper",
  "activation.access_codes": "Kode Akses",
  "activation.submissions": "Pengajuan Aktivasi",
  "activation.peruri_export": "Export Peruri",
  "activation.settings": "Pengaturan Aktivasi",
  "activation.audit_log": "Audit Log Aktivasi",
  "access.users": "Pengguna",
  "access.roles": "Hak Akses",
  repository: "Repository",
};

export const PERMISSION_GROUPS: { section: string; items: PermissionKey[] }[] = [
  { section: "OVERVIEW", items: ["overview"] },
  {
    section: "PERSURATAN",
    items: [
      "persuratan.change_email",
      "persuratan.check_order_id",
      "persuratan.kop_surat",
      "persuratan.stamper",
    ],
  },
  {
    section: "PORTAL AKTIVASI",
    items: [
      "activation.access_codes",
      "activation.submissions",
      "activation.peruri_export",
      "activation.settings",
      "activation.audit_log",
    ],
  },
  { section: "MANAJEMEN AKSES", items: ["access.users", "access.roles"] },
  { section: "REPOSITORY", items: ["repository"] },
];

export const ALL_PERMISSIONS: PermissionKey[] = PERMISSION_GROUPS.flatMap((g) => g.items);

export const seedRoles: RoleDef[] = [
  {
    id: "role-super-admin",
    name: "Super Admin",
    description: "Akses penuh ke seluruh modul Digdaya Ops.",
    permissions: [...ALL_PERMISSIONS],
    primaryAccess: "Semua menu",
  },
  {
    id: "role-reviewer",
    name: "Reviewer Aktivasi",
    description: "Mereview pengajuan aktivasi organisasi NU.",
    permissions: [
      "overview",
      "activation.submissions",
      "activation.peruri_export",
      "activation.audit_log",
    ],
    primaryAccess: "Portal Aktivasi (Review)",
  },
  {
    id: "role-ops-persuratan",
    name: "Admin Ops Persuratan",
    description: "Mengelola modul persuratan dan repository.",
    permissions: [
      "overview",
      "persuratan.change_email",
      "persuratan.check_order_id",
      "persuratan.kop_surat",
      "persuratan.stamper",
      "repository",
    ],
    primaryAccess: "Persuratan, Repository",
  },
  {
    id: "role-admin-pw",
    name: "Admin PW",
    description: "Mengelola dashboard PW dan mendaftarkan organisasi bawahan.",
    permissions: [],
    primaryAccess: "Dashboard PW",
  },
  {
    id: "role-admin-pc",
    name: "Admin PC",
    description: "Mengelola dashboard PC dan mendaftarkan organisasi bawahan.",
    permissions: [],
    primaryAccess: "Dashboard PC",
  },
];

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86400_000).toISOString();

export const seedUsers: UserAccount[] = [
  {
    id: "u-admin",
    name: "Admin",
    email: "admin@digdaya.nu.id",
    phone: "+628110000001",
    role: "Super Admin",
    orgName: "PBNU",
    orgLevel: "PB",
    status: "Aktif",
    lastLoginAt: hoursAgo(2),
    createdAt: daysAgo(180),
  },
  {
    id: "u-reviewer",
    name: "Reviewer Tim Digdaya",
    email: "reviewer@digdaya.nu.id",
    phone: "+628110000002",
    role: "Reviewer Aktivasi",
    orgName: "PBNU",
    orgLevel: "PB",
    status: "Aktif",
    lastLoginAt: hoursAgo(5),
    createdAt: daysAgo(150),
  },
  {
    id: "u-pw-diy",
    name: "Admin PW DIY",
    email: "pw@digdaya.nu.id",
    phone: "+628110000003",
    role: "Admin PW",
    orgName: "PWNU DI Yogyakarta",
    orgLevel: "PW",
    parentOrgName: "PBNU",
    status: "Aktif",
    lastLoginAt: daysAgo(1),
    createdAt: daysAgo(120),
  },
  {
    id: "u-pc-sleman",
    name: "Admin PC Sleman",
    email: "pc@digdaya.nu.id",
    phone: "+628110000004",
    role: "Admin PC",
    orgName: "PCNU Kabupaten Sleman",
    orgLevel: "PC",
    parentOrgName: "PWNU DI Yogyakarta",
    status: "Aktif",
    lastLoginAt: daysAgo(2),
    createdAt: daysAgo(110),
  },
  {
    id: "u-pc-kraksaan",
    name: "Admin PCNU Kraksaan",
    email: "pc.kraksaan@digdaya.nu.id",
    phone: "+628110000005",
    role: "Admin PC",
    orgName: "PCNU Kraksaan",
    orgLevel: "PC",
    parentOrgName: "PWNU Jawa Timur",
    status: "Aktif",
    lastLoginAt: hoursAgo(20),
    createdAt: daysAgo(90),
  },
  {
    id: "u-pc-yogya",
    name: "Admin PCNU Kota Yogyakarta",
    email: "pc.yogyakarta@digdaya.nu.id",
    phone: "+628110000006",
    role: "Admin PC",
    orgName: "PCNU Kota Yogyakarta",
    orgLevel: "PC",
    parentOrgName: "PWNU DI Yogyakarta",
    status: "Menunggu Aktivasi",
    createdAt: daysAgo(3),
  },
];

/** Return the effective permission set for a user (override > role preset). */
export function effectivePermissions(user: UserAccount, roles: RoleDef[]): PermissionKey[] {
  if (user.permissions && user.permissions.length > 0) return user.permissions;
  const role = roles.find((r) => r.name === user.role);
  return role ? role.permissions : [];
}
