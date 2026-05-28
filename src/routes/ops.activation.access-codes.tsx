import { createFileRoute, Link } from "@tanstack/react-router";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { DataTable, THead, TH, TR, TD, RowAction, EmptyRow } from "@/components/dashboard/DataTable";
import { actions, useStore, effectiveStatusOrg } from "@/lib/store";
import { masterPC, masterPW, type Tingkat, type AccessCode } from "@/data/mockData";
import { AccessCodeStatusBadge } from "@/components/JalurBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Plus, Ban, Search, Eye, Info as InfoIcon, Clock, Download } from "lucide-react";
import { formatDate } from "@/utils/status";

export const Route = createFileRoute("/ops/activation/access-codes")({
  component: AccessCodes,
});

type Kind = "Scoped" | "Individual";
type Mode = "auto" | "whitelist";

interface FormErrors {
  batchName?: string;
  code?: string;
  scope?: string;
  org?: string;
  whitelist?: string;
  validDays?: string;
  eligible?: string;
}

function slugUp(s: string) {
  return s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function autoCodeFromForm(batchName: string, tingkat: Tingkat, wilayahPwId: string): string {
  const base = batchName ? slugUp(batchName) : `ONBOARD-${tingkat}`;
  const scope = wilayahPwId === "Nasional" ? "NASIONAL" : (masterPW.find((p) => p.id === wilayahPwId)?.wilayah ?? "").toUpperCase().replace(/\s+/g, "");
  const parts = ["ONBOARD", tingkat, scope].filter(Boolean);
  return base.startsWith("ONBOARD") ? base : parts.join("-");
}

function AccessCodes() {
  const codes = useStore((s) => s.accessCodes);
  const sla = useStore((s) => s.sla);

  // --- Filter state ---
  const [tingkatFilter, setTingkatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");

  // --- Modal state ---
  const [open, setOpen] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [codeStr, setCodeStr] = useState("");
  const [codeEdited, setCodeEdited] = useState(false);
  const [kind, setKind] = useState<Kind>("Scoped");
  const [tingkat, setTingkat] = useState<Tingkat>("PC");
  const [wilayahPwId, setWilayahPwId] = useState<string>("Nasional");
  const [mode, setMode] = useState<Mode>("auto");
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [individualOrgId, setIndividualOrgId] = useState<string>("");
  const [validDays, setValidDays] = useState(sla.defaultCodeValidDays);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const pwList = masterPW;

  const resetForm = () => {
    setBatchName(""); setCodeStr(""); setCodeEdited(false);
    setKind("Scoped"); setTingkat("PC"); setWilayahPwId("Nasional");
    setMode("auto"); setWhitelist([]); setIndividualOrgId("");
    setValidDays(sla.defaultCodeValidDays); setNote(""); setErrors({});
  };

  // Auto-fill code suggestion (until user edits manually)
  useEffect(() => {
    if (codeEdited) return;
    setCodeStr(autoCodeFromForm(batchName, tingkat, wilayahPwId));
  }, [batchName, tingkat, wilayahPwId, codeEdited]);

  // --- Eligible preview ---
  const eligibleOrgs = useMemo(() => {
    if (kind === "Individual") return [];
    const list: { id: string; nama: string; pwName: string }[] = tingkat === "PC"
      ? masterPC
          .filter((p) => wilayahPwId === "Nasional" || p.pwId === wilayahPwId)
          .filter((p) => effectiveStatusOrg(p.id) === "Belum Production")
          .map((p) => ({ id: p.id, nama: p.nama, pwName: p.pw }))
      : masterPW
          .filter((p) => effectiveStatusOrg(p.id) === "Belum Production")
          .filter((p) => wilayahPwId === "Nasional" || p.id === wilayahPwId)
          .map((p) => ({ id: p.id, nama: p.nama, pwName: p.nama }));
    if (mode === "whitelist") {
      return list.filter((o) => whitelist.includes(o.id));
    }
    return list;
  }, [kind, tingkat, wilayahPwId, mode, whitelist]);

  const whitelistCandidates = useMemo(() => {
    if (tingkat === "PC") {
      return masterPC
        .filter((p) => wilayahPwId === "Nasional" || p.pwId === wilayahPwId)
        .filter((p) => effectiveStatusOrg(p.id) === "Belum Production")
        .map((p) => ({ id: p.id, nama: p.nama, pwName: p.pw }));
    }
    return masterPW
      .filter((p) => effectiveStatusOrg(p.id) === "Belum Production")
      .filter((p) => wilayahPwId === "Nasional" || p.id === wilayahPwId)
      .map((p) => ({ id: p.id, nama: p.nama, pwName: p.nama }));
  }, [tingkat, wilayahPwId]);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!batchName.trim()) e.batchName = "Nama batch / keterangan wajib diisi.";
    if (!codeStr.trim()) e.code = "Kode akses wajib diisi.";
    else if (actions.accessCodeExists(codeStr)) e.code = "Kode ini sudah digunakan. Pilih kode lain.";
    else if (!/^[A-Z0-9-]+$/.test(codeStr)) e.code = "Hanya huruf kapital, angka, dan tanda hubung.";
    if (!validDays || validDays < 1) e.validDays = "Masa berlaku minimal 1 hari.";
    if (kind === "Individual") {
      if (!individualOrgId) e.org = "Pilih organisasi target.";
    } else {
      if (mode === "whitelist" && whitelist.length === 0) e.whitelist = "Minimal pilih 1 organisasi.";
      if (eligibleOrgs.length === 0) e.eligible = "Tidak ada organisasi eligible dalam scope ini.";
    }
    return e;
  };

  const liveErrors = validate();
  const canSubmit = Object.keys(liveErrors).length === 0;

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 300));
    let created: AccessCode | null = null;
    if (kind === "Scoped") {
      created = actions.createScopedAccessCode({
        code: codeStr, batchName, tingkat, wilayahPwId, mode,
        whitelist: mode === "whitelist" ? whitelist : undefined,
        validDays, note: note || undefined,
      });
    } else {
      created = actions.createIndividualAccessCode({
        code: codeStr, batchName, tingkat, orgId: individualOrgId,
        validDays, note: note || undefined,
      });
    }
    setSubmitting(false);
    if (!created) { toast.error("Gagal membuat kode akses."); return; }
    toast.success("Kode akses berhasil dibuat.");
    setOpen(false); resetForm();
  };

  // --- Table data ---
  const filtered = useMemo(() => codes
    .filter((c) => tingkatFilter === "all" || c.tingkat === tingkatFilter)
    .filter((c) => {
      if (statusFilter === "all") return true;
      const eff = displayStatus(c);
      return eff === statusFilter;
    })
    .filter((c) => !q ||
      c.code.toLowerCase().includes(q.toLowerCase()) ||
      (c.batchName ?? "").toLowerCase().includes(q.toLowerCase()) ||
      (c.orgName ?? "").toLowerCase().includes(q.toLowerCase()) ||
      c.pw.toLowerCase().includes(q.toLowerCase())),
    [codes, tingkatFilter, statusFilter, q]);

  return (
    <div>
      <OpsPageHeader
        title="Kode Akses Aktivasi"
        subtitle="Buat dan kelola kode akses untuk aktivasi PW/PC yang belum production."
        breadcrumb={[{ label: "Aktivasi Digdaya", to: "/ops/activation" }, { label: "Kode Akses" }]}
      />
      <OpsPageBody>
        <div className="rounded-lg border border-[oklch(0.88_0.04_180)] bg-[oklch(0.97_0.02_180)] p-3.5 text-[12.5px] text-foreground/85">
          <p className="flex items-start gap-2">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              Kode akses digunakan untuk mengaktifkan PW/PC yang belum production. Setelah kode dimasukkan,
              pendaftar akan memilih kepengurusan dari daftar master data yang sesuai scope kode.
              MWC, Lembaga, dan Ranting tidak menggunakan kode akses — didaftarkan oleh PW/PC yang sudah production.
            </span>
          </p>
        </div>

        <OpsCard
          title="Kelola Kode Akses"
          description="Buat kode akses scoped/individual untuk onboarding PW/PC dan pantau penggunaannya."
          action={<Button size="sm" onClick={() => { resetForm(); setOpen(true); }}><Plus className="mr-1.5 h-4 w-4" /> Buat Kode Akses</Button>}
        >
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:flex-1 sm:min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari kode / batch / wilayah" value={q} onChange={(e) => setQ(e.target.value)} className="h-10 w-full pl-9" />
            </div>
            <SelectFilter value={tingkatFilter} onChange={setTingkatFilter} placeholder="Tingkat" options={[["all","Semua Tingkat"],["PW","PW"],["PC","PC"]]} />
            <SelectFilter value={statusFilter} onChange={setStatusFilter} placeholder="Status" options={[["all","Semua Status"],["Aktif","Aktif"],["Kedaluwarsa","Kedaluwarsa"],["Dinonaktifkan","Dinonaktifkan"]]} />
          </div>
        </OpsCard>

        {/* Desktop table */}
        <div className="hidden md:block">
          <DataTable className="mx-0">
            <THead>
              <tr>
                <TH>Kode Akses</TH>
                <TH>Nama Batch</TH>
                <TH>Jenis</TH>
                <TH>Tingkat</TH>
                <TH>Scope</TH>
                <TH>Mode</TH>
                <TH className="text-center">Eligible</TH>
                <TH className="text-center">Belum</TH>
                <TH className="text-center">Pending</TH>
                <TH className="text-center">Produksi</TH>
                <TH>Expired</TH>
                <TH>Status</TH>
                <TH className="text-right pr-6">Aksi</TH>
              </tr>
            </THead>
            <tbody>
              {filtered.map((c) => <CodeRow key={c.code} code={c} />)}
              {filtered.length === 0 && <EmptyRow colSpan={13}>Tidak ada kode akses sesuai filter.</EmptyRow>}
            </tbody>
          </DataTable>
        </div>

        {/* Mobile card list */}
        <div className="space-y-3 md:hidden">
          {filtered.map((c) => <CodeCard key={c.code} code={c} />)}
          {filtered.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-[13px] text-muted-foreground">
              Tidak ada kode akses sesuai filter.
            </div>
          )}
        </div>
      </OpsPageBody>

      {/* Create modal */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto p-0 sm:p-0">
          <DialogHeader className="border-b border-border px-5 py-4 sm:px-6">
            <DialogTitle>Buat Kode Akses Aktivasi</DialogTitle>
            <DialogDescription className="text-[12.5px]">
              Kode akses hanya untuk PW/PC yang belum production. Pendaftar memilih kepengurusan dari master data sesuai scope kode.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-4 sm:px-6">
            {/* Nama Batch */}
            <Field label="Nama Batch / Keterangan" required error={errors.batchName}>
              <Input value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="Contoh: Onboarding PC DIY Mei 2026" />
            </Field>

            {/* Kode */}
            <Field label="Kode Akses" required error={errors.code} hint="Auto-generate. Bisa diedit. Huruf kapital, angka, dan tanda hubung.">
              <Input
                value={codeStr}
                onChange={(e) => { setCodeStr(e.target.value.toUpperCase()); setCodeEdited(true); }}
                placeholder="ONBOARD-PC-DIY-MEI2026"
                className="font-mono uppercase tracking-wide"
              />
            </Field>

            {/* Jenis */}
            <Field label="Jenis Kode" required hint="Gunakan Scoped Batch Code untuk onboarding banyak PW/PC sekaligus. Individual Code hanya untuk kasus khusus.">
              <Select value={kind} onValueChange={(v) => setKind(v as Kind)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scoped">Scoped Batch Code</SelectItem>
                  <SelectItem value="Individual">Individual Code</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* Tingkat */}
            <Field label="Tingkat Organisasi" required>
              <Select value={tingkat} onValueChange={(v) => { setTingkat(v as Tingkat); setWhitelist([]); setIndividualOrgId(""); setWilayahPwId("Nasional"); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PW">PW (Pengurus Wilayah)</SelectItem>
                  <SelectItem value="PC">PC (Pengurus Cabang)</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* Scope wilayah */}
            <Field label={tingkat === "PC" ? "PW Induk (Scope Wilayah)" : "Scope Wilayah"} required>
              <Select value={wilayahPwId} onValueChange={(v) => { setWilayahPwId(v); setWhitelist([]); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nasional">Nasional</SelectItem>
                  {pwList.map((p) => <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>

            {kind === "Scoped" ? (
              <>
                <Field label="Mode Daftar Organisasi" hint="Mode otomatis akan menampilkan semua organisasi sesuai tingkat dan wilayah yang statusnya belum production.">
                  <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Otomatis dari master data belum production</SelectItem>
                      <SelectItem value="whitelist">Whitelist Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {mode === "whitelist" && (
                  <Field label={`Pilih Organisasi (${whitelist.length} dipilih)`} required error={errors.whitelist}>
                    <div className="max-h-52 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                      {whitelistCandidates.map((o) => (
                        <label key={o.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-[13px] hover:bg-secondary/50">
                          <Checkbox
                            checked={whitelist.includes(o.id)}
                            onCheckedChange={() => setWhitelist((w) => w.includes(o.id) ? w.filter((x) => x !== o.id) : [...w, o.id])}
                          />
                          <span className="flex-1">{o.nama}</span>
                          <span className="text-[11px] text-muted-foreground">{o.pwName.replace("PWNU ","")}</span>
                        </label>
                      ))}
                      {whitelistCandidates.length === 0 && (
                        <p className="px-2 py-4 text-center text-[12px] text-muted-foreground">Tidak ada organisasi belum production di scope ini.</p>
                      )}
                    </div>
                  </Field>
                )}

                {/* Preview eligible */}
                <div className="rounded-md border border-border bg-secondary/40 p-3">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Organisasi yang akan dapat menggunakan kode ini</p>
                  {eligibleOrgs.length > 0 ? (
                    <>
                      <p className="mt-1.5 text-[13px] font-medium text-foreground">
                        {eligibleOrgs.length} {tingkat} eligible {wilayahPwId !== "Nasional" ? `di ${masterPW.find((p) => p.id === wilayahPwId)?.nama}` : "secara nasional"}.
                      </p>
                      <ul className="mt-2 max-h-36 space-y-0.5 overflow-y-auto text-[12.5px] text-foreground">
                        {eligibleOrgs.slice(0, 10).map((o) => (
                          <li key={o.id} className="flex justify-between gap-3">
                            <span>{o.nama}</span>
                            <span className="text-[11px] text-muted-foreground">{o.pwName.replace("PWNU ","")}</span>
                          </li>
                        ))}
                        {eligibleOrgs.length > 10 && <li className="text-[11px] text-muted-foreground">+ {eligibleOrgs.length - 10} lainnya</li>}
                      </ul>
                    </>
                  ) : (
                    <p className="mt-1.5 text-[12.5px] text-destructive">Tidak ada organisasi belum production dalam scope ini.</p>
                  )}
                </div>
              </>
            ) : (
              <Field label="Organisasi Target" required error={errors.org}>
                <Select value={individualOrgId} onValueChange={setIndividualOrgId}>
                  <SelectTrigger><SelectValue placeholder="Pilih organisasi belum production" /></SelectTrigger>
                  <SelectContent>
                    {whitelistCandidates.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {whitelistCandidates.length === 0 && (
                  <p className="mt-1 text-[12px] text-destructive">Tidak ada organisasi belum production di scope ini.</p>
                )}
              </Field>
            )}

            {/* Masa berlaku */}
            <Field label="Masa Berlaku (hari)" required error={errors.validDays}>
              <Input type="number" min={1} value={validDays} onChange={(e) => setValidDays(Number(e.target.value))} />
            </Field>

            {/* Catatan */}
            <Field label="Catatan Internal" hint="Opsional. Hanya terlihat oleh Ops.">
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan tambahan untuk batch ini..." />
            </Field>
          </div>

          <DialogFooter className="border-t border-border bg-secondary/30 px-5 py-3 sm:px-6">
            <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Batal</Button>
            <Button onClick={handleSubmit} disabled={submitting || !canSubmit}>
              {submitting ? "Membuat..." : "Buat Kode Akses"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- Helpers ----------

function displayStatus(c: AccessCode): "Aktif" | "Kedaluwarsa" | "Dinonaktifkan" {
  if (c.status === "Disabled") return "Dinonaktifkan";
  if (c.status === "Used") return "Dinonaktifkan";
  if (c.status === "Expired" || new Date(c.expiredAt).getTime() < Date.now()) return "Kedaluwarsa";
  return "Aktif";
}

interface CodeStats { eligible: number; belum: number; pending: number; perbaikan: number; production: number; }

function useCodeStats(c: AccessCode): CodeStats {
  const regs = useStore((s) => s.registrations);
  return useMemo(() => {
    const eligibleList = actions.getEligibleOrgsForCode(c);
    const totalEligible = c.kind === "Scoped" ? eligibleList.length : 1;
    const subs = regs.filter((r) => r.accessCode === c.code);
    const pending = subs.filter((r) => r.status === "Pending").length;
    const perbaikan = subs.filter((r) => r.status === "PerluPerbaikan").length;
    const production = subs.filter((r) => r.status === "Approved").length;
    const submittedIds = new Set(subs.map((s) => s.selectedOrgId ?? c.orgId).filter(Boolean));
    const belum = c.kind === "Scoped"
      ? eligibleList.filter((o) => o.statusOrg === "Belum Production" && !submittedIds.has(o.id)).length
      : (effectiveStatusOrg(c.orgId) === "Belum Production" && pending + perbaikan + production === 0 ? 1 : 0);
    return { eligible: totalEligible, belum, pending, perbaikan, production };
  }, [c, regs]);
}

function CodeRow({ code }: { code: AccessCode }) {
  const stats = useCodeStats(code);
  const status = displayStatus(code);
  const scopeLabel = code.kind === "Scoped"
    ? (code.scope?.wilayahPwId === "Nasional" ? "Nasional" : (masterPW.find((p) => p.id === code.scope?.wilayahPwId)?.nama ?? code.pw))
    : code.orgName;
  return (
    <TR>
      <TD className="font-mono text-[12px] text-primary-dark">{code.code}</TD>
      <TD className="text-[12.5px]">{code.batchName ?? "—"}</TD>
      <TD className="text-[12px]">{code.kind ?? "Individual"}</TD>
      <TD>
        <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold " + (code.tingkat === "PW" ? "bg-[oklch(0.93_0.06_240)] text-[oklch(0.34_0.10_240)]" : "bg-secondary text-foreground")}>{code.tingkat}</span>
      </TD>
      <TD className="text-[12.5px]">{scopeLabel}</TD>
      <TD className="text-[12px]">{code.scope?.mode === "whitelist" ? "Whitelist" : (code.kind === "Scoped" ? "Otomatis" : "—")}</TD>
      <TD className="text-center text-[12.5px] font-semibold">{stats.eligible}</TD>
      <TD className="text-center text-[12.5px]">{stats.belum}</TD>
      <TD className="text-center text-[12.5px]">{stats.pending + stats.perbaikan}</TD>
      <TD className="text-center text-[12.5px]">{stats.production}</TD>
      <TD className="text-[12px]">{formatDate(code.expiredAt)}</TD>
      <TD><AccessCodeStatusBadge status={code.status} /></TD>
      <TD className="text-right pr-6">
        <div className="flex justify-end gap-1">
          <Link
            to="/ops/activation/access-codes/$codeId"
            params={{ codeId: code.code }}
            title="Detail"
            aria-label={`Detail ${code.code}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-primary hover:bg-accent transition-colors"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <RowAction title="Salin kode" onClick={() => { navigator.clipboard.writeText(code.code); toast.success("Kode disalin."); }}><Copy className="h-4 w-4" /></RowAction>
          {status === "Aktif" && (
            <RowAction title="Perpanjang 30 hari" onClick={() => { actions.extendAccessCode(code.code, 30); toast.success("Masa berlaku diperpanjang 30 hari."); }}><Clock className="h-4 w-4" /></RowAction>
          )}
          {status === "Aktif" && (
            <RowAction title="Nonaktifkan" tone="danger" onClick={() => { actions.disableAccessCode(code.code); toast.success("Kode dinonaktifkan."); }}><Ban className="h-4 w-4" /></RowAction>
          )}
        </div>
      </TD>

    </TR>
  );
}

function CodeCard({ code }: { code: AccessCode }) {
  const stats = useCodeStats(code);
  const status = displayStatus(code);
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[12.5px] font-semibold text-primary-dark">{code.code}</p>
          <p className="mt-0.5 truncate text-[13px] font-medium text-foreground">{code.batchName ?? code.orgName}</p>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            {code.kind ?? "Individual"} · {code.tingkat} · {code.scope?.wilayahPwId === "Nasional" ? "Nasional" : code.pw}
          </p>
        </div>
        <AccessCodeStatusBadge status={code.status} />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        <MiniStat label="Eligible" value={stats.eligible} />
        <MiniStat label="Belum" value={stats.belum} />
        <MiniStat label="Pending" value={stats.pending + stats.perbaikan} />
        <MiniStat label="Produksi" value={stats.production} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to="/ops/activation/access-codes/$codeId" params={{ codeId: code.code }} className="flex-1">
          <Button variant="outline" size="sm" className="h-9 w-full"><Eye className="mr-1.5 h-3.5 w-3.5" /> Detail</Button>
        </Link>
        <Button variant="outline" size="sm" className="h-9" onClick={() => { navigator.clipboard.writeText(code.code); toast.success("Kode disalin."); }}>
          <Copy className="h-3.5 w-3.5" />
        </Button>
        {status === "Aktif" && (
          <Button variant="outline" size="sm" className="h-9" onClick={() => { actions.disableAccessCode(code.code); toast.success("Kode dinonaktifkan."); }}>
            <Ban className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">Expired: {formatDate(code.expiredAt)}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-background py-1.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-[15px] font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Field({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <p className="mt-1 text-[11.5px] text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1 text-[11.5px] font-medium text-destructive">{error}</p>}
    </div>
  );
}

function SelectFilter({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: [string, string][]; placeholder?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full sm:w-[170px]"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
