import { createFileRoute, Link } from "@tanstack/react-router";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { useStore, effectiveStatusOrg } from "@/lib/store";
import { masterPC, masterPW } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { AccessCodeStatusBadge } from "@/components/JalurBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Ban, Copy, Download } from "lucide-react";
import { formatDate } from "@/utils/status";
import { toast } from "sonner";
import { actions } from "@/lib/store";

export const Route = createFileRoute("/ops/activation/access-codes/$codeId")({
  component: AccessCodeDetail,
});

function AccessCodeDetail() {
  const { codeId } = Route.useParams();
  const code = useStore((s) => s.accessCodes.find((c) => c.code === codeId));
  const regs = useStore((s) => s.registrations);

  if (!code) {
    return (
      <div>
        <OpsPageHeader title="Kode Tidak Ditemukan" breadcrumb={[{ label: "Aktivasi Digdaya", to: "/ops/activation" }, { label: "Kode Akses", to: "/ops/activation/access-codes" }, { label: "Detail" }]} />
        <OpsPageBody>
          <OpsCard><p className="text-sm text-muted-foreground">Kode akses tidak ditemukan.</p></OpsCard>
        </OpsPageBody>
      </div>
    );
  }

  // Scope eligible orgs (best-effort)
  const eligible = code.kind === "Scoped"
    ? [...masterPC, ...masterPW].filter((o) => (code.tingkat === "PW" ? "pw" in o === false : "pw" in o) && (!code.scope?.wilayahPwId || ("pw" in o && o.pw === code.scope?.wilayahPwId)))
    : [...masterPC, ...masterPW].filter((o) => o.id === code.orgId);

  const submissions = regs.filter((r) => r.accessCode === code.code);
  const submittedOrgIds = new Set(submissions.map((s) => s.selectedOrgId ?? s.tipeOrg + "-" + s.namaOrg));

  const counts = {
    eligible: eligible.length,
    belumSubmit: eligible.filter((o) => effectiveStatusOrg(o.id) !== "Production" && !submittedOrgIds.has(o.id)).length,
    pending: submissions.filter((s) => s.status === "Pending").length,
    perbaikan: submissions.filter((s) => s.status === "PerluPerbaikan").length,
    production: submissions.filter((s) => s.status === "Approved").length,
    tolak: submissions.filter((s) => s.status === "RejectedFinal").length,
  };

  return (
    <div>
      <OpsPageHeader
        title="Detail Kode Akses"
        breadcrumb={[{ label: "Aktivasi Digdaya", to: "/ops/activation" }, { label: "Kode Akses", to: "/ops/activation/access-codes" }, { label: code.code }]}
        action={<Link to="/ops/activation/access-codes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Kembali</Link>}
      />
      <OpsPageBody>
        <OpsCard title="Informasi Kode Akses" action={<Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(code.code); toast.success("Kode disalin."); }}><Copy className="mr-1.5 h-3.5 w-3.5" /> Salin Kode</Button>}>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Info label="Kode Akses" value={code.code} mono />
            <Info label="Nama Batch" value={code.batchName ?? "—"} />
            <Info label="Tipe Kode" value={code.kind ?? "Individual"} />
            <Info label="Tingkat" value={code.tingkat} />
            <Info label="Scope Wilayah" value={code.scope?.wilayahPwId ?? (code.kind === "Scoped" ? "Nasional" : code.pw)} />
            <Info label="Mode Daftar" value={code.scope?.mode === "whitelist" ? "Whitelist Manual" : "Otomatis"} />
            <Info label="Masa Berlaku" value={`${formatDate(code.generatedAt)} – ${formatDate(code.expiredAt)}`} />
            <Info label="Status" value={<AccessCodeStatusBadge status={code.status} />} />
          </dl>
        </OpsCard>

        <OpsCard title="Progress Aktivasi">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="Total Eligible" value={counts.eligible} />
            <Stat label="Belum Submit" value={counts.belumSubmit} />
            <Stat label="Pending" value={counts.pending} />
            <Stat label="Perlu Perbaikan" value={counts.perbaikan} />
            <Stat label="Production" value={counts.production} />
            <Stat label="Ditolak Final" value={counts.tolak} />
          </div>
        </OpsCard>

        <OpsCard
          title="Pengajuan dari Kode Ini"
          action={<>
            {code.status === "Unused" && <Button size="sm" variant="outline" onClick={() => { actions.disableAccessCode(code.code); toast.success("Kode dinonaktifkan."); }}><Ban className="mr-1.5 h-3.5 w-3.5" /> Disable</Button>}
            <Button size="sm" variant="outline"><Download className="mr-1.5 h-3.5 w-3.5" /> Export Daftar</Button>
          </>}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-[13px]">
              <thead className="bg-secondary/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-3 py-2.5">Tiket</th><th className="px-3 py-2.5">Organisasi</th><th className="px-3 py-2.5">Administrator</th><th className="px-3 py-2.5">Tanggal</th><th className="px-3 py-2.5">Status</th></tr>
              </thead>
              <tbody>
                {submissions.length === 0 && <tr><td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">Belum ada pengajuan dari kode ini.</td></tr>}
                {submissions.map((s) => (
                  <tr key={s.ticketId} className="border-t border-border">
                    <td className="px-3 py-2.5 font-mono text-[12px]">
                      <Link to="/ops/activation/submissions/$ticketId" params={{ ticketId: s.ticketId }} className="text-primary hover:underline">{s.ticketId}</Link>
                    </td>
                    <td className="px-3 py-2.5">{s.namaOrg}</td>
                    <td className="px-3 py-2.5">{s.namaAdmin}</td>
                    <td className="px-3 py-2.5">{formatDate(s.submittedAt)}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </OpsCard>
      </OpsPageBody>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={"mt-0.5 text-sm font-medium text-foreground " + (mono ? "font-mono" : "")}>{value}</dd>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}
