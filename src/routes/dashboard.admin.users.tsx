import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";

export const Route = createFileRoute("/dashboard/admin/users")({
  component: UsersPage,
});

const users = [
  { email: "admin@digdaya.nu.id", name: "Super Admin Digdaya", role: "Super Admin", status: "Aktif" },
  { email: "reviewer@digdaya.nu.id", name: "Reviewer Digdaya", role: "Reviewer", status: "Aktif" },
];

function UsersPage() {
  return (
    <div>
      <PageHeader title="User Management" subtitle="Pengguna internal Tim Digdaya PBNU." />
      <div className="px-6 pb-10">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">Nama</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.email}>
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-xs">{u.email}</td>
                  <td className="px-4 py-3"><span className="rounded bg-secondary px-1.5 py-0.5 text-[11px] font-medium">{u.role}</span></td>
                  <td className="px-4 py-3"><span className="rounded-md border border-success/30 bg-success/15 px-2 py-0.5 text-xs font-medium text-success">{u.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
