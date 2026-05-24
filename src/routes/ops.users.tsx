import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, MoreHorizontal } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PermissionChecklist } from "@/components/ops/PermissionChecklist";
import { actions, useStore } from "@/lib/store";
import type { PermissionKey, RoleName, UserAccount, UserStatus } from "@/data/usersData";
import { toast } from "sonner";

export const Route = createFileRoute("/ops/users")({
  component: UsersPage,
});

const STATUSES: UserStatus[] = ["Aktif", "Nonaktif"];

function statusVariant(s: UserStatus): "default" | "outline" {
  return s === "Aktif" ? "default" : "outline";
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

  const [editing, setEditing] = useState<UserAccount | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState<UserAccount | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserAccount | null>(null);

  const roleOptions = useMemo(() => roles.map((r) => r.name), [roles]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return users.filter((u) => {
      if (qq && !(u.name.toLowerCase().includes(qq) || u.email.toLowerCase().includes(qq))) return false;
      if (fRole !== "ALL" && u.role !== fRole) return false;
      if (fStatus !== "ALL" && u.status !== fStatus) return false;
      return true;
    });
  }, [users, q, fRole, fStatus]);

  return (
    <div>
      <OpsPageHeader
        title="Pengguna"
        subtitle="Kelola pengguna internal Digdaya Ops dan hak aksesnya."
        breadcrumb={[{ label: "Pengguna" }]}
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah Pengguna
          </Button>
        }
      />
      <OpsPageBody>
        <OpsCard>
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-6">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Pencarian</Label>
              <div className="relative mt-1.5">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau email" className="pl-9" />
              </div>
            </div>
            <FilterSelect label="Hak Akses" value={fRole} onChange={setFRole} options={["ALL", ...roleOptions]} className="md:col-span-3" />
            <FilterSelect label="Status" value={fStatus} onChange={setFStatus} options={["ALL", ...STATUSES]} className="md:col-span-3" />
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
                <span className="text-muted-foreground">Hak Akses</span>
                <span className="text-right">{u.role}</span>
                <span className="text-muted-foreground">Terakhir Login</span>
                <span className="text-right">{formatDate(u.lastLoginAt)}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(u)}>Edit</Button>
                {u.status === "Aktif" ? (
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setConfirmDisable(u)}>Nonaktifkan</Button>
                ) : (
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { actions.setUserStatus(u.id, "Aktif"); toast.success("Pengguna berhasil diaktifkan."); }}>Aktifkan</Button>
                )}
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
                  <TableHead>Hak Akses</TableHead>
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
                          <DropdownMenuItem onSelect={() => setEditing(u)}>Edit</DropdownMenuItem>
                          {u.status === "Aktif" ? (
                            <DropdownMenuItem onSelect={() => setConfirmDisable(u)}>Nonaktifkan</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onSelect={() => { actions.setUserStatus(u.id, "Aktif"); toast.success("Pengguna berhasil diaktifkan."); }}>Aktifkan</DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onSelect={() => setConfirmDelete(u)}>Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      Tidak ada pengguna yang cocok dengan filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </OpsPageBody>

      {/* Create / Edit drawer */}
      <UserFormSheet
        open={creating || !!editing}
        initial={editing}
        onClose={() => { setCreating(false); setEditing(null); }}
      />

      {/* Confirm Disable */}
      <AlertDialog open={!!confirmDisable} onOpenChange={(o) => !o && setConfirmDisable(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nonaktifkan pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Pengguna <strong>{confirmDisable?.name}</strong> tidak akan dapat mengakses Digdaya Ops sampai diaktifkan kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDisable) {
                  actions.setUserStatus(confirmDisable.id, "Nonaktif");
                  toast.success("Pengguna berhasil dinonaktifkan.");
                }
                setConfirmDisable(null);
              }}
            >
              Nonaktifkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Delete */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Pengguna <strong>{confirmDelete?.name}</strong> akan dihapus permanen dari Digdaya Ops.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) {
                  actions.deleteUser(confirmDelete.id);
                  toast.success("Pengguna dihapus.");
                }
                setConfirmDelete(null);
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

const CUSTOM_VALUE = "__custom__";

function UserFormSheet({
  open,
  initial,
  onClose,
}: {
  open: boolean;
  initial: UserAccount | null;
  onClose: () => void;
}) {
  const users = useStore((s) => s.users);
  const roles = useStore((s) => s.roles);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleSelection, setRoleSelection] = useState<string>("");
  const [customPerms, setCustomPerms] = useState<PermissionKey[]>([]);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setEmail(initial.email);
      setRoleSelection(initial.role);
      setCustomPerms([]);
    } else {
      setName("");
      setEmail("");
      setRoleSelection(roles[0]?.name ?? "");
      setCustomPerms([]);
    }
  }, [open, initial?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const isCustom = roleSelection === CUSTOM_VALUE;

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName) return toast.error("Nama wajib diisi.");
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return toast.error("Email tidak valid.");
    if (!roleSelection) return toast.error("Hak akses wajib dipilih.");

    const dup = users.find((u) => u.email.toLowerCase() === trimmedEmail && u.id !== initial?.id);
    if (dup) return toast.error("Email sudah digunakan oleh pengguna lain.");

    let roleName: RoleName = roleSelection;
    if (isCustom) {
      if (customPerms.length === 0) return toast.error("Pilih minimal satu menu untuk hak akses custom.");
      // Buat role custom baru per pengguna.
      const customRole = actions.createRole({
        name: `Custom — ${trimmedName}`,
        description: `Hak akses khusus untuk ${trimmedName}.`,
        permissions: customPerms,
      });
      roleName = customRole.name;
    }

    if (initial) {
      actions.updateUser(initial.id, { name: trimmedName, email: trimmedEmail, role: roleName });
      toast.success("Pengguna berhasil diperbarui.");
    } else {
      actions.createUser({ name: trimmedName, email: trimmedEmail, role: roleName, status: "Aktif" });
      toast.success("Pengguna berhasil ditambahkan.");
    }
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initial ? "Edit Pengguna" : "Tambah Pengguna"}</SheetTitle>
          <SheetDescription>
            {initial ? "Perbarui nama, email, atau hak akses pengguna." : "Tambahkan pengguna internal Digdaya Ops."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          <Field label="Nama">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama pengguna" />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Masukkan email pengguna" />
          </Field>
          <Field label="Hak Akses">
            <Select value={roleSelection} onValueChange={setRoleSelection}>
              <SelectTrigger><SelectValue placeholder="Pilih hak akses" /></SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                ))}
                <SelectItem value={CUSTOM_VALUE}>Custom</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {isCustom && (
            <PermissionChecklist value={customPerms} onChange={setCustomPerms} />
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} className="sm:w-auto">Batal</Button>
          <Button onClick={handleSave} className="sm:w-auto">
            {initial ? "Simpan Perubahan" : "Simpan Pengguna"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
