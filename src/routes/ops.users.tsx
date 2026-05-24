import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Download, Search, MoreHorizontal } from "lucide-react";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PermissionChecklist } from "@/components/ops/PermissionChecklist";
import { actions, useStore } from "@/lib/store";
import {
  effectivePermissions,
  PERMISSION_LABELS,
  type OrgLevel,
  type PermissionKey,
  type RoleName,
  type UserAccount,
  type UserStatus,
} from "@/data/usersData";
import { toast } from "sonner";

export const Route = createFileRoute("/ops/users")({
  component: UsersPage,
});

const ROLES: RoleName[] = ["Super Admin", "Reviewer Aktivasi", "Admin Ops Persuratan", "Admin PW", "Admin PC"];
const LEVELS: OrgLevel[] = ["PB", "PW", "PC", "MWC", "Ranting", "Lembaga"];
const STATUSES: UserStatus[] = ["Aktif", "Nonaktif", "Menunggu Aktivasi"];

function statusVariant(s: UserStatus): "default" | "secondary" | "outline" | "destructive" {
  if (s === "Aktif") return "default";
  if (s === "Menunggu Aktivasi") return "secondary";
  return "outline";
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function UsersPage() {
  const users = useStore((s) => s.users);
  const roles = useStore((s) => s.roles);

  const [q, setQ] = useState("");
  const [fRole, setFRole] = useState<string>("ALL");
  const [fStatus, setFStatus] = useState<string>("ALL");
  const [fLevel, setFLevel] = useState<string>("ALL");
  const [fOrg, setFOrg] = useState<string>("ALL");

  const [editing, setEditing] = useState<UserAccount | null>(null);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<UserAccount | null>(null);

  const orgOptions = useMemo(() => Array.from(new Set(users.map((u) => u.orgName))).sort(), [users]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return users.filter((u) => {
      if (qq && !(u.name.toLowerCase().includes(qq) || u.email.toLowerCase().includes(qq) || u.orgName.toLowerCase().includes(qq))) return false;
      if (fRole !== "ALL" && u.role !== fRole) return false;
      if (fStatus !== "ALL" && u.status !== fStatus) return false;
      if (fLevel !== "ALL" && u.orgLevel !== fLevel) return false;
      if (fOrg !== "ALL" && u.orgName !== fOrg) return false;
      return true;
    });
  }, [users, q, fRole, fStatus, fLevel, fOrg]);

  const exportCsv = () => {
    const header = ["Nama", "Email", "Organisasi", "Level", "Role", "Status", "Terakhir Login"];
    const rows = filtered.map((u) => [u.name, u.email, u.orgName, u.orgLevel, u.role, u.status, formatDate(u.lastLoginAt)]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pengguna-digdaya-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Mengekspor ${filtered.length} pengguna.`);
  };

  return (
    <div>
      <OpsPageHeader
        title="Master Data Pengguna"
        subtitle="Kelola pengguna, organisasi, role, dan hak akses di Digdaya Ops."
        breadcrumb={[{ label: "Master Data Pengguna" }]}
        action={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download className="mr-1.5 h-4 w-4" /> Export Pengguna
            </Button>
            <Button onClick={() => setCreating(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Tambah Pengguna
            </Button>
          </>
        }
      />
      <OpsPageBody>
        <OpsCard>
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Pencarian</Label>
              <div className="relative mt-1.5">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, email, atau organisasi" className="pl-9" />
              </div>
            </div>
            <FilterSelect label="Role" value={fRole} onChange={setFRole} options={["ALL", ...ROLES]} className="md:col-span-2" />
            <FilterSelect label="Status" value={fStatus} onChange={setFStatus} options={["ALL", ...STATUSES]} className="md:col-span-2" />
            <FilterSelect label="Level" value={fLevel} onChange={setFLevel} options={["ALL", ...LEVELS]} className="md:col-span-2" />
            <FilterSelect label="Organisasi" value={fOrg} onChange={setFOrg} options={["ALL", ...orgOptions]} className="md:col-span-2" />
          </div>
          <div className="mt-3 text-[12px] text-muted-foreground">
            Menampilkan {filtered.length} dari {users.length} pengguna.
          </div>
        </OpsCard>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {filtered.map((u) => (
            <div key={u.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-foreground">{u.name}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{u.email}</p>
                </div>
                <Badge variant={statusVariant(u.status)}>{u.status}</Badge>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-y-1 text-[12px]">
                <span className="text-muted-foreground">Organisasi</span>
                <span className="text-right truncate">{u.orgName}</span>
                <span className="text-muted-foreground">Level</span>
                <span className="text-right">{u.orgLevel}</span>
                <span className="text-muted-foreground">Role</span>
                <span className="text-right">{u.role}</span>
                <span className="text-muted-foreground">Terakhir Login</span>
                <span className="text-right">{formatDate(u.lastLoginAt)}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setViewing(u)}>Detail</Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(u)}>Edit</Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Tidak ada pengguna yang cocok.</p>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Organisasi</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Terakhir Login</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>{u.orgName}</TableCell>
                    <TableCell>{u.orgLevel}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell><Badge variant={statusVariant(u.status)}>{u.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(u.lastLoginAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" aria-label="Aksi">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onSelect={() => setViewing(u)}>Detail</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setEditing(u)}>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {u.status === "Aktif" ? (
                            <DropdownMenuItem onSelect={() => { actions.setUserStatus(u.id, "Nonaktif"); toast.success(`${u.name} dinonaktifkan.`); }}>
                              Nonaktifkan
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onSelect={() => { actions.setUserStatus(u.id, "Aktif"); toast.success(`${u.name} diaktifkan.`); }}>
                              Aktifkan
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onSelect={() => { actions.resetUserAccess(u.id); toast.success(`Hak akses ${u.name} di-reset ke preset role.`); }}>
                            Reset Akses
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      Tidak ada pengguna yang cocok dengan filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </OpsPageBody>

      {/* Detail drawer */}
      <UserDetailSheet
        user={viewing}
        onClose={() => setViewing(null)}
        onEdit={(u) => { setViewing(null); setEditing(u); }}
      />

      {/* Create / Edit drawer */}
      <UserFormSheet
        open={creating || !!editing}
        initial={editing}
        roles={roles.map((r) => r.name)}
        onClose={() => { setCreating(false); setEditing(null); }}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>{o === "ALL" ? "Semua" : o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function UserDetailSheet({
  user,
  onClose,
  onEdit,
}: {
  user: UserAccount | null;
  onClose: () => void;
  onEdit: (u: UserAccount) => void;
}) {
  const roles = useStore((s) => s.roles);
  const audit = useStore((s) => s.audit);
  if (!user) return null;
  const perms = effectivePermissions(user, roles);
  const userAudit = audit.filter((a) => a.detail?.toLowerCase().includes(user.name.toLowerCase()) || a.detail?.toLowerCase().includes(user.email.toLowerCase())).slice(0, 8);

  return (
    <Sheet open={!!user} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detail Pengguna</SheetTitle>
          <SheetDescription>{user.name}</SheetDescription>
        </SheetHeader>
        <div className="mt-5 space-y-4">
          <DetailCard title="Informasi Pengguna">
            <DetailRow label="Nama" value={user.name} />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Nomor HP" value={user.phone ?? "—"} />
            <DetailRow label="Status" value={<Badge variant={statusVariant(user.status)}>{user.status}</Badge>} />
            <DetailRow label="Terakhir Login" value={formatDate(user.lastLoginAt)} />
          </DetailCard>
          <DetailCard title="Organisasi">
            <DetailRow label="Organisasi" value={user.orgName} />
            <DetailRow label="Level" value={user.orgLevel} />
            {user.parentOrgName && <DetailRow label="Induk Organisasi" value={user.parentOrgName} />}
          </DetailCard>
          <DetailCard title="Role & Hak Akses">
            <DetailRow label="Role" value={user.role} />
            <div className="mt-2">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Menu yang dapat diakses</p>
              {perms.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">Tidak ada akses ke menu Digdaya Ops (gunakan dashboard {user.role.replace("Admin ", "")}).</p>
              ) : (
                <ul className="grid grid-cols-1 gap-1 text-[12px]">
                  {perms.map((p) => (
                    <li key={p} className="rounded bg-secondary/60 px-2 py-1">• {PERMISSION_LABELS[p]}</li>
                  ))}
                </ul>
              )}
            </div>
          </DetailCard>
          <DetailCard title="Riwayat Aktivitas">
            {userAudit.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">Belum ada aktivitas tercatat.</p>
            ) : (
              <ul className="space-y-2 text-[12.5px]">
                {userAudit.map((a) => (
                  <li key={a.id} className="border-l-2 border-primary/40 pl-3">
                    <p className="font-medium text-foreground">{a.action}</p>
                    <p className="text-muted-foreground">{a.detail}</p>
                    <p className="text-[10.5px] text-muted-foreground">{new Date(a.timestamp).toLocaleString("id-ID")}</p>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => onEdit(user)}>Edit Pengguna</Button>
          {user.status === "Aktif" ? (
            <Button variant="outline" onClick={() => { actions.setUserStatus(user.id, "Nonaktif"); toast.success(`${user.name} dinonaktifkan.`); onClose(); }}>Nonaktifkan</Button>
          ) : (
            <Button variant="outline" onClick={() => { actions.setUserStatus(user.id, "Aktif"); toast.success(`${user.name} diaktifkan.`); onClose(); }}>Aktifkan</Button>
          )}
          <Button variant="ghost" onClick={onClose}>Kembali</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="space-y-1.5 text-[13px]">{children}</div>
    </div>
  );
}
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function UserFormSheet({
  open,
  initial,
  roles,
  onClose,
}: {
  open: boolean;
  initial: UserAccount | null;
  roles: RoleName[];
  onClose: () => void;
}) {
  const allRoles = useStore((s) => s.roles);
  const [form, setForm] = useState<{
    name: string;
    email: string;
    phone: string;
    orgName: string;
    parentOrgName: string;
    orgLevel: OrgLevel;
    role: RoleName;
    status: UserStatus;
    permissions: PermissionKey[];
    permissionsOverridden: boolean;
  }>(() => buildForm(initial, allRoles));

  // Reset when opening with a new target
  useState(() => undefined); // placate
  // We use the open/initial as dependency via a key approach below

  if (!open) return null;

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
        else setForm(buildForm(initial, allRoles));
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initial ? "Edit Pengguna" : "Tambah Pengguna"}</SheetTitle>
          <SheetDescription>
            {initial ? "Perbarui data pengguna dan hak akses." : "Lengkapi data pengguna baru dan tentukan hak akses menu."}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="profil" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="profil" className="flex-1">Profil</TabsTrigger>
            <TabsTrigger value="akses" className="flex-1">Hak Akses</TabsTrigger>
          </TabsList>

          <TabsContent value="profil" className="mt-4 space-y-3">
            <Field label="Nama Lengkap">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Nomor HP">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+62…" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Organisasi">
                <Input value={form.orgName} onChange={(e) => setForm({ ...form, orgName: e.target.value })} />
              </Field>
              <Field label="Induk Organisasi (opsional)">
                <Input value={form.parentOrgName} onChange={(e) => setForm({ ...form, parentOrgName: e.target.value })} />
              </Field>
              <Field label="Level Organisasi">
                <Select value={form.orgLevel} onValueChange={(v) => setForm({ ...form, orgLevel: v as OrgLevel })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Role">
                <Select
                  value={form.role}
                  onValueChange={(v) => {
                    const role = v as RoleName;
                    const preset = allRoles.find((r) => r.name === role);
                    setForm({
                      ...form,
                      role,
                      permissions: form.permissionsOverridden ? form.permissions : (preset?.permissions ?? []),
                    });
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as UserStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </TabsContent>

          <TabsContent value="akses" className="mt-4">
            <PermissionChecklist
              value={form.permissions}
              onChange={(next) => setForm({ ...form, permissions: next, permissionsOverridden: true })}
            />
            {form.permissionsOverridden && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  const preset = allRoles.find((r) => r.name === form.role);
                  setForm({ ...form, permissions: preset?.permissions ?? [], permissionsOverridden: false });
                }}
              >
                Reset ke preset role {form.role}
              </Button>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button
            onClick={() => {
              if (!form.name.trim() || !form.email.trim() || !form.orgName.trim()) {
                toast.error("Nama, email, dan organisasi wajib diisi.");
                return;
              }
              const payload = {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                phone: form.phone.trim() || undefined,
                orgName: form.orgName.trim(),
                parentOrgName: form.parentOrgName.trim() || undefined,
                orgLevel: form.orgLevel,
                role: form.role,
                status: form.status,
                permissions: form.permissionsOverridden ? form.permissions : undefined,
              };
              if (initial) {
                actions.updateUser(initial.id, payload);
                if (form.permissionsOverridden) {
                  actions.updateUserPermissions(initial.id, form.permissions);
                }
                toast.success("Pengguna berhasil diperbarui.");
              } else {
                actions.createUser(payload);
                toast.success("Pengguna baru ditambahkan.");
              }
              onClose();
            }}
          >
            {initial ? "Simpan Perubahan" : "Tambah Pengguna"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function buildForm(initial: UserAccount | null, roles: { name: RoleName; permissions: PermissionKey[] }[]) {
  if (initial) {
    const preset = roles.find((r) => r.name === initial.role);
    const overridden = !!initial.permissions && initial.permissions.length > 0;
    return {
      name: initial.name,
      email: initial.email,
      phone: initial.phone ?? "",
      orgName: initial.orgName,
      parentOrgName: initial.parentOrgName ?? "",
      orgLevel: initial.orgLevel,
      role: initial.role,
      status: initial.status,
      permissions: overridden ? initial.permissions! : (preset?.permissions ?? []),
      permissionsOverridden: overridden,
    };
  }
  const preset = roles.find((r) => r.name === "Admin PC");
  return {
    name: "",
    email: "",
    phone: "",
    orgName: "",
    parentOrgName: "",
    orgLevel: "PC" as OrgLevel,
    role: "Admin PC" as RoleName,
    status: "Menunggu Aktivasi" as UserStatus,
    permissions: preset?.permissions ?? [],
    permissionsOverridden: false,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
