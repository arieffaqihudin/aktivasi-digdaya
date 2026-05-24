// ============================================================
// Master Data Pengguna Internal Digdaya Ops & Hak Akses
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

export type UserStatus = "Aktif" | "Nonaktif";

/** Free string — bisa preset bawaan maupun custom yang dibuat Super Admin. */
export type RoleName = string;

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  /** Nama hak akses (role) yang dipilih. */
  role: RoleName;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
}

export interface RoleDef {
  id: string;
  name: RoleName;
  description: string;
  permissions: PermissionKey[];
  /** Role bawaan sistem — tidak dapat dihapus. */
  isSystem?: boolean;
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
    isSystem: true,
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
    isSystem: true,
  },
  {
    id: "role-ops-persuratan",
    name: "Admin Ops Persuratan",
    description: "Mengelola modul persuratan Digdaya.",
    permissions: [
      "overview",
      "persuratan.change_email",
      "persuratan.check_order_id",
      "persuratan.kop_surat",
      "persuratan.stamper",
    ],
    isSystem: true,
  },
  {
    id: "role-repository",
    name: "Admin Repository",
    description: "Mengelola repository dokumen Digdaya.",
    permissions: ["overview", "repository"],
    isSystem: true,
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
    role: "Super Admin",
    status: "Aktif",
    lastLoginAt: hoursAgo(2),
    createdAt: daysAgo(180),
  },
  {
    id: "u-reviewer",
    name: "Reviewer Tim Digdaya",
    email: "reviewer@digdaya.nu.id",
    role: "Reviewer Aktivasi",
    status: "Aktif",
    lastLoginAt: hoursAgo(5),
    createdAt: daysAgo(150),
  },
  {
    id: "u-ops-persuratan",
    name: "Admin Ops Persuratan",
    email: "ops.persuratan@digdaya.nu.id",
    role: "Admin Ops Persuratan",
    status: "Aktif",
    lastLoginAt: daysAgo(1),
    createdAt: daysAgo(120),
  },
  {
    id: "u-repository",
    name: "Admin Repository",
    email: "repository@digdaya.nu.id",
    role: "Admin Repository",
    status: "Aktif",
    lastLoginAt: daysAgo(2),
    createdAt: daysAgo(90),
  },
];

/** Return the effective permission set for a user (role-based). */
export function effectivePermissions(user: UserAccount, roles: RoleDef[]): PermissionKey[] {
  const role = roles.find((r) => r.name === user.role);
  return role ? role.permissions : [];
}
