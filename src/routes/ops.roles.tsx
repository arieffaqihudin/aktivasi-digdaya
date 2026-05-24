import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Copy, Trash2, MoreHorizontal } from "lucide-react";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { PERMISSION_LABELS, type PermissionKey, type RoleDef } from "@/data/usersData";
import { toast } from "sonner";

export const Route = createFileRoute("/ops/roles")({
  component: RolesPage,
});

function RolesPage() {
  const roles = useStore((s) => s.roles);
  const users = useStore((s) => s.users);
  const [editing, setEditing] = useState<RoleDef | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<RoleDef | null>(null);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const u of users) m.set(u.role, (m.get(u.role) ?? 0) + 1);
    return m;
  }, [users]);

  return (
    <div>
      <OpsPageHeader
        title="Hak Akses"
        subtitle="Atur template hak akses menu untuk pengguna internal Digdaya Ops."
        breadcrumb={[{ label: "Hak Akses" }]}
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Tambah Hak Akses
          </Button>
        }
      />
      <OpsPageBody>
        <OpsCard>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {roles.map((r) => (
              <div key={r.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[14px] font-semibold">{r.name}</p>
                  <Badge variant="secondary">{counts.get(r.name) ?? 0} pengguna</Badge>
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">{r.description}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {r.permissions.length} menu diakses
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(r)}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => duplicate(r)}>
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Duplikasi
                  </Button>
                  {!r.isSystem && (
                    <Button size="sm" variant="outline" className="flex-1 text-destructive" onClick={() => setConfirmDelete(r)}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Hapus
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Hak Akses</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Jumlah Pengguna</TableHead>
                  <TableHead>Menu yang Diakses</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.name}
                      {r.isSystem && <Badge variant="outline" className="ml-2 text-[10px]">Sistem</Badge>}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[320px]">{r.description}</TableCell>
                    <TableCell>{counts.get(r.name) ?? 0}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[320px]">
                      <span className="line-clamp-2 text-[12.5px]">
                        {r.permissions.length === 0
                          ? "—"
                          : r.permissions.map((p) => PERMISSION_LABELS[p]).join(", ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" aria-label="Aksi">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onSelect={() => setEditing(r)}>
                            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => duplicate(r)}>
                            <Copy className="mr-2 h-3.5 w-3.5" /> Duplikasi
                          </DropdownMenuItem>
                          {!r.isSystem && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onSelect={() => setConfirmDelete(r)}>
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </OpsCard>
      </OpsPageBody>

      <RoleFormSheet
        open={creating || !!editing}
        initial={editing}
        onClose={() => { setCreating(false); setEditing(null); }}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus hak akses?</AlertDialogTitle>
            <AlertDialogDescription>
              Hak akses <strong>{confirmDelete?.name}</strong> akan dihapus. Pengguna yang masih menggunakan hak akses ini perlu dipindahkan ke hak akses lain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) {
                  const ok = actions.deleteRole(confirmDelete.id);
                  if (ok) toast.success("Hak akses dihapus.");
                  else toast.error("Hak akses sistem tidak dapat dihapus.");
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

  function duplicate(r: RoleDef) {
    const copy = actions.createRole({
      name: `${r.name} (Salinan)`,
      description: r.description,
      permissions: [...r.permissions],
    });
    toast.success(`Hak akses "${copy.name}" berhasil dibuat.`);
    setEditing(copy);
  }
}

function RoleFormSheet({
  open,
  initial,
  onClose,
}: {
  open: boolean;
  initial: RoleDef | null;
  onClose: () => void;
}) {
  const roles = useStore((s) => s.roles);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [perms, setPerms] = useState<PermissionKey[]>([]);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setDescription(initial.description);
      setPerms([...initial.permissions]);
    } else {
      setName("");
      setDescription("");
      setPerms([]);
    }
  }, [open, initial?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return toast.error("Nama hak akses wajib diisi.");
    if (perms.length === 0) return toast.error("Pilih minimal satu menu.");

    const dup = roles.find((r) => r.name.toLowerCase() === trimmedName.toLowerCase() && r.id !== initial?.id);
    if (dup) return toast.error("Nama hak akses sudah digunakan.");

    if (initial) {
      actions.updateRolePermissions(initial.id, {
        name: initial.isSystem ? initial.name : trimmedName,
        description,
        permissions: perms,
      });
      toast.success("Hak akses berhasil diperbarui.");
    } else {
      actions.createRole({ name: trimmedName, description, permissions: perms });
      toast.success("Hak akses berhasil ditambahkan.");
    }
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initial ? `Edit Hak Akses — ${initial.name}` : "Tambah Hak Akses"}</SheetTitle>
          <SheetDescription>
            Centang menu sidebar yang dapat diakses oleh pengguna dengan hak akses ini.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nama Hak Akses</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!!initial?.isSystem}
              placeholder="Contoh: Admin Aktivasi Wilayah"
              className="mt-1.5"
            />
            {initial?.isSystem && (
              <p className="mt-1 text-[11px] text-muted-foreground">Nama hak akses sistem tidak dapat diubah.</p>
            )}
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Deskripsi</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan fungsi hak akses ini"
              className="mt-1.5"
              rows={2}
            />
          </div>
          <PermissionChecklist value={perms} onChange={setPerms} />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSave}>
            {initial ? "Simpan Perubahan" : "Simpan Hak Akses"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
