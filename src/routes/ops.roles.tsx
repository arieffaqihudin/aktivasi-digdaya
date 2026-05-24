import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PermissionChecklist } from "@/components/ops/PermissionChecklist";
import { actions, useStore } from "@/lib/store";
import type { PermissionKey, RoleDef } from "@/data/usersData";
import { toast } from "sonner";

export const Route = createFileRoute("/ops/roles")({
  component: RolesPage,
});

function RolesPage() {
  const roles = useStore((s) => s.roles);
  const users = useStore((s) => s.users);
  const [editing, setEditing] = useState<RoleDef | null>(null);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const u of users) m.set(u.role, (m.get(u.role) ?? 0) + 1);
    return m;
  }, [users]);

  return (
    <div>
      <OpsPageHeader
        title="Hak Akses"
        subtitle="Atur template role dan menu yang dapat diakses pengguna."
        breadcrumb={[{ label: "Hak Akses" }]}
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
                <p className="mt-1 text-[12px]"><span className="text-muted-foreground">Akses utama:</span> {r.primaryAccess}</p>
                <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => setEditing(r)}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Hak Akses
                </Button>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Role</TableHead>
                  <TableHead>Jumlah Pengguna</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Akses Utama</TableHead>
                  <TableHead className="w-32 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{counts.get(r.name) ?? 0}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[320px]">{r.description}</TableCell>
                    <TableCell>{r.primaryAccess}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setEditing(r)}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </OpsCard>
      </OpsPageBody>

      <RoleEditSheet role={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function RoleEditSheet({ role, onClose }: { role: RoleDef | null; onClose: () => void }) {
  const [description, setDescription] = useState("");
  const [perms, setPerms] = useState<PermissionKey[]>([]);

  useEffect(() => {
    if (role) {
      setDescription(role.description);
      setPerms([...role.permissions]);
    }
  }, [role?.id]);

  if (!role) return null;

  return (
    <Sheet open={!!role} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Hak Akses — {role.name}</SheetTitle>
          <SheetDescription>
            Centang menu yang dapat diakses oleh pengguna dengan role ini. Perubahan akan langsung diterapkan ke seluruh pengguna dengan role yang sama (kecuali yang sudah memiliki override).
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nama Role</Label>
            <Input value={role.name} disabled className="mt-1.5" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Deskripsi</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" rows={2} />
          </div>
          <PermissionChecklist value={perms} onChange={setPerms} />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button
            onClick={() => {
              actions.updateRolePermissions(role.id, { description, permissions: perms });
              toast.success(`Hak akses role ${role.name} disimpan.`);
              onClose();
            }}
          >
            Simpan Hak Akses
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
