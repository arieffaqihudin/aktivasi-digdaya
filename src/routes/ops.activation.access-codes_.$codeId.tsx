import { createFileRoute, Link } from "@tanstack/react-router";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { useStore, effectiveStatusOrg, actions } from "@/lib/store";
import { masterPW } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { AccessCodeStatusBadge } from "@/components/JalurBadge";
import { ArrowLeft, Ban, Copy, Clock } from "lucide-react";
import { formatDate } from "@/utils/status";
import { toast } from "sonner";
import { useMemo } from "react";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/ops/activation/access-codes_/$codeId")({
  component: AccessCodeDetail,
});

function AccessCodeDetail() {
  const { codeId } = Route.useParams();
  const code = useStore((s) => s.accessCodes.find((c) => c.code === codeId));
  const regs = useStore((s) => s.registrations);

  const eligibleList = useMemo(() => code ? actions.getEligibleOrgsForCode(code) : [], [code, regs]);

  // Map orgId → latest registration via this code
  const regsByOrg = useMemo(() => {
    const m = new Map<string, typeof regs[number]>();
    if (!code) return m;
    for (const r of regs.filter((r) => r.accessCode === code.code)) {
      const orgId = r.selectedOrgId ?? code.orgId;
      if (!orgId) continue;
      const cur = m.get(orgId);
      if (!cur || new Date(r.submittedAt).getTime() > new Date(cur.submittedAt).getTime()) m.set(orgId, r);
    }
    return m;
  }, [regs, code]);

  const rows = useMemo(() => {
    if (!code) return [];
    const base = code.kind === "Scoped" ? eligibleList : eligibleList.length ? eligibleList : (code.orgId ? [{
      id: code.orgId, nama: code.orgName, tingkat: code.tingkat,
      pwName: code.pw, statusOrg: effectiveStatusOrg(code.orgId), hasActiveSubmission: false,
    }] : []);
    return base.map((o) => {
      const reg = regsByOrg.get(o.id);
      const orgStatus = effectiveStatusOrg(o.id);
      let display: "Belum Submit" | "Pending Aktivasi" | "Perlu Perbaikan" | "Production" | "Ditolak Final" = "Belum Submit";
      if (reg) {
        if (reg.status === "Approved") display = "Production";
        else if (reg.status === "PerluPerbaikan") display = "Perlu Perbaikan";
        else if (reg.status === "RejectedFinal") display = "Ditolak Final";
        else display = "Pending Aktivasi";
      } else if (orgStatus === "Production") display = "Production";
      else if (orgStatus === "Pending Aktivasi") display = "Pending Aktivasi";
      return { ...o, reg, orgStatus, display };
    });
  }, [eligibleList, regsByOrg, code]);

  if (!code) {
    return (
      <div>
        <OpsPageHeader title="Kode Tidak Ditemukan" breadcrumb={[{ label: "Aktivasi Digdaya", to: "/ops/activation" }, { label: "Kode Akses", to: "/ops/activation/access-codes" }, { label: "Detail" }]} />
        <OpsPageBody>
          <OpsCard>
            <p className="text-sm text-muted-foreground">Kode akses tidak ditemukan.</p>
            <Link to="/ops/activation/access-codes" className="mt-3 inline-block text-sm text-primary hover:underline">← Kembali ke daftar kode akses</Link>
          </OpsCard>
        </OpsPageBody>
      </div>
    );
  }

  const counts = {
    eligible: rows.length,
    belum: rows.filter((r) => r.display === "Belum Submit").length,
    pending: rows.filter((r) => r.display === "Pending Aktivasi").length,
    perbaikan: rows.filter((r) => r.display === "Perlu Perbaikan").length,
    production: rows.filter((r) => r.display === "Production").length,
    tolak: rows.filter((r) => r.display === "Ditolak Final").length,
  };

  const scopeLabel = code.kind === "Scoped"
    ? (code.scope?.wilayahPwId === "Nasional" ? "Nasional" : (masterPW.find((p) => p.id === code.scope?.wilayahPwId)?.nama ?? code.pw))
    : code.orgName;

  const codeStatus = displayStatus(code);


  return (
    <div>
      <OpsPageHeader
        title="Detail Kode Akses"
        breadcrumb={[{ label: "Aktivasi Digdaya", to: "/ops/activation" }, { label: "Kode Akses", to: "/ops/activation/access-codes" }, { label: code.code }]}
        action={<Link to="/ops/activation/access-codes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Kembali</Link>}
      />
      <OpsPageBody>
        <OpsCard
          title="Informasi Kode"
          action={<div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(code.code); toast.success("Kode disalin."); }}><Copy className="mr-1.5 h-3.5 w-3.5" /> Salin Kode</Button>
            {codeStatus === "Aktif" && (
              <>
                <Button size="sm" variant="outline" onClick={() => { actions.extendAccessCode(code.code, 30); toast.success("Masa berlaku diperpanjang 30 hari."); }}><Clock className="mr-1.5 h-3.5 w-3.5" /> +30 Hari</Button>
                <Button size="sm" variant="outline" onClick={() => { actions.disableAccessCode(code.code); toast.success("Kode dinonaktifkan."); }}><Ban className="mr-1.5 h-3.5 w-3.5" /> Nonaktifkan</Button>
              </>
            )}
          </div>}
        >
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Info label="Kode Akses" value={code.code} mono />
            <Info label="Nama Batch" value={code.batchName ?? "—"} />
            <Info label="Jenis Kode" value={code.kind ?? "Individual"} />
            <Info label="Tingkat" value={code.tingkat} />
            <Info label="Scope Wilayah" value={scopeLabel} />
            <Info label="Mode Daftar" value={code.scope?.mode === "whitelist" ? "Whitelist Manual" : (code.kind === "Scoped" ? "Otomatis dari master data" : "—")} />
            <Info label="Masa Berlaku" value={`${formatDate(code.generatedAt)} – ${formatDate(code.expiredAt)}`} />
            <Info label="Status" value={<AccessCodeStatusBadge status={code.status} />} />
          </dl>
        </OpsCard>

        <OpsCard title="Progress Aktivasi">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="Total Eligible" value={counts.eligible} />
            <Stat label="Belum Submit" value={counts.belum} />
            <Stat label="Pending Aktivasi" value={counts.pending} />
            <Stat label="Perlu Perbaikan" value={counts.perbaikan} />
            <Stat label="Production" value={counts.production} />
            <Stat label="Ditolak Final" value={counts.tolak} />
          </div>
        </OpsCard>

        <OpsCard title="Daftar Organisasi dalam Scope" description="Status terkini setiap organisasi yang berada dalam scope kode ini.">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[820px] text-[13px]">
              <thead className="bg-secondary/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5">Organisasi</th>
                  <th className="px-3 py-2.5">Tingkat</th>
                  <th className="px-3 py-2.5">Wilayah</th>
                  <th className="px-3 py-2.5">Status Pengajuan</th>
                  <th className="px-3 py-2.5">Nomor Tiket</th>
                  <th className="px-3 py-2.5">Administrator</th>
                  <th className="px-3 py-2.5">Tgl Submit</th>
                  <th className="px-3 py-2.5 text-right pr-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">Tidak ada organisasi dalam scope.</td></tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-2.5 font-medium text-foreground">{r.nama}</td>
                    <td className="px-3 py-2.5">{r.tingkat}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.pwName.replace("PWNU ","")}</td>
                    <td className="px-3 py-2.5"><OrgStatusPill status={r.display} /></td>
                    <td className="px-3 py-2.5 font-mono text-[12px]">
                      {r.reg ? (
                        <Link to="/ops/activation/submissions/$ticketId" params={{ ticketId: r.reg.ticketId }} className="text-primary hover:underline">{r.reg.ticketId}</Link>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-2.5">{r.reg?.namaAdmin ?? "—"}</td>
                    <td className="px-3 py-2.5 text-[12px]">{r.reg ? formatDate(r.reg.submittedAt) : "—"}</td>
                    <td className="px-3 py-2.5 text-right pr-4">
                      {r.reg ? (
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <Link to="/ops/activation/submissions/$ticketId" params={{ ticketId: r.reg.ticketId }}>
                            <Button size="sm" variant="outline" className="h-8">Lihat Pengajuan</Button>
                          </Link>
                          <WhatsAppButton phone={r.reg.hp} ticketId={r.reg.ticketId} />
                        </div>
                      ) : <span className="text-[11.5px] text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="space-y-2.5 md:hidden">
            {rows.length === 0 && (
              <p className="rounded-md border border-dashed border-border p-4 text-center text-[13px] text-muted-foreground">Tidak ada organisasi dalam scope.</p>
            )}
            {rows.map((r) => (
              <div key={r.id} className="rounded-md border border-border bg-background p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-foreground">{r.nama}</p>
                    <p className="text-[11.5px] text-muted-foreground">{r.tingkat} · {r.pwName.replace("PWNU ","")}</p>
                  </div>
                  <OrgStatusPill status={r.display} />
                </div>
                {r.reg && (
                  <div className="mt-2 text-[12px] text-muted-foreground">
                    Tiket <span className="font-mono text-foreground">{r.reg.ticketId}</span> · {r.reg.namaAdmin} · {formatDate(r.reg.submittedAt)}
                  </div>
                )}
                {r.reg && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Link to="/ops/activation/submissions/$ticketId" params={{ ticketId: r.reg.ticketId }}>
                      <Button size="sm" variant="outline" className="h-8">Lihat Pengajuan</Button>
                    </Link>
                    <WhatsAppButton phone={r.reg.hp} ticketId={r.reg.ticketId} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </OpsCard>
      </OpsPageBody>
    </div>
  );
}

function displayStatus(c: { status: string; expiredAt: string }): "Aktif" | "Kedaluwarsa" | "Dinonaktifkan" {
  if (c.status === "Disabled" || c.status === "Used") return "Dinonaktifkan";
  if (c.status === "Expired" || new Date(c.expiredAt).getTime() < Date.now()) return "Kedaluwarsa";
  return "Aktif";
}

function OrgStatusPill({ status }: { status: "Belum Submit" | "Pending Aktivasi" | "Perlu Perbaikan" | "Production" | "Ditolak Final" }) {
  const cls: Record<string, string> = {
    "Belum Submit":     "bg-[oklch(0.95_0.005_160)] text-[oklch(0.38_0.02_160)]",
    "Pending Aktivasi": "bg-[oklch(0.95_0.08_85)] text-[oklch(0.42_0.08_80)]",
    "Perlu Perbaikan":  "bg-[oklch(0.94_0.08_55)] text-[oklch(0.42_0.10_50)]",
    "Production":       "bg-[oklch(0.94_0.06_150)] text-[oklch(0.36_0.10_152)]",
    "Ditolak Final":    "bg-[oklch(0.94_0.06_25)] text-[oklch(0.42_0.13_25)]",
  };
  return <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium " + cls[status]}>{status}</span>;
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
