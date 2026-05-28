import { Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";
import { useStore, actions } from "@/lib/store";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, FileWarning, Loader2, Sparkles } from "lucide-react";
import { REJECTION_CATEGORY_LABEL, masterMWC, type SumberSuratTugas } from "@/data/mockData";
import { SuratTugasSelector, validateSuratTugas, type SuratTugasValue } from "@/components/forms/SuratTugasSelector";
import { AdministratorForm, adminFromExisting, adminToSubmit, validateAdmin } from "@/components/forms/AdministratorForm";

// Common email typo domains -> suggested correction
const EMAIL_TYPO_MAP: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gamil.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "hotnail.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "outlok.com": "outlook.com",
};

function suggestEmail(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at <= 0) return null;
  const domain = email.slice(at + 1).toLowerCase().trim();
  const fix = EMAIL_TYPO_MAP[domain];
  if (!fix || fix === domain) return null;
  return email.slice(0, at + 1) + fix;
}

export function InternalRevisionForm({ ticketId, scope }: { ticketId: string; scope: "pw" | "pc" }) {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const reg = useStore((s) => s.registrations.find((r) => r.ticketId === ticketId));

  const initialSumber: SumberSuratTugas = (reg?.sumberSuratTugas as SumberSuratTugas) ?? "DIGDAYA_PERSURATAN";
  const [admin, setAdmin] = useState(() => adminFromExisting(reg ?? {}));
  const [surat, setSurat] = useState<SuratTugasValue>({
    sumber: initialSumber,
    dokumen: reg?.dokumenSistem ?? null,
    file: null,
  });

  // Ranting-only editable fields
  const [namaOrg, setNamaOrg] = useState(reg?.namaOrg ?? "");
  const [parentMwcId, setParentMwcId] = useState(reg?.parentMwcId ?? "");
  const [village, setVillage] = useState(reg?.village ?? "");
  const [locationNote, setLocationNote] = useState("");

  const [busy, setBusy] = useState(false);

  const backTo = scope === "pw" ? "/pw/status-pengajuan" : "/pc/status-pengajuan";
  const detailTo = scope === "pw" ? "/pw/status-pengajuan/$ticketId" : "/pc/status-pengajuan/$ticketId";

  // Available MWCs (under the PC of this submission)
  const availableMwcs = useMemo(() => {
    if (!reg?.sourcePcId) return masterMWC;
    return masterMWC.filter((m) => m.pcId === reg.sourcePcId);
  }, [reg?.sourcePcId]);

  // Track changes for "Ringkasan Revisi"
  const emailSuggestion = suggestEmail(admin.email ?? "");
  const changes = useMemo(() => {
    if (!reg) return [] as { label: string; before: string; after: string }[];
    const list: { label: string; before: string; after: string }[] = [];
    const submit = adminToSubmit(admin);
    if (submit.namaAdmin !== reg.namaAdmin) list.push({ label: "Nama Administrator", before: reg.namaAdmin, after: submit.namaAdmin });
    if (submit.jabatan !== reg.jabatan) list.push({ label: "Jabatan", before: reg.jabatan, after: submit.jabatan });
    if (submit.nik !== reg.nik) list.push({ label: "NIK", before: reg.nik, after: submit.nik });
    if (submit.hp !== reg.hp) list.push({ label: "WhatsApp", before: reg.hp, after: submit.hp });
    if (submit.email !== reg.email) list.push({ label: "Email", before: reg.email, after: submit.email });
    if (reg.tipeOrg === "Ranting") {
      if (namaOrg !== reg.namaOrg) list.push({ label: "Nama Ranting", before: reg.namaOrg, after: namaOrg });
      if (parentMwcId && parentMwcId !== reg.parentMwcId) {
        const after = availableMwcs.find((m) => m.id === parentMwcId)?.nama ?? parentMwcId;
        list.push({ label: "MWC Induk", before: reg.parentMwcName ?? "-", after });
      }
      if ((village ?? "") !== (reg.village ?? "")) list.push({ label: "Desa/Kelurahan", before: reg.village ?? "-", after: village || "-" });
    }
    if (surat.sumber !== reg.sumberSuratTugas) {
      list.push({
        label: "Sumber Surat Tugas",
        before: reg.sumberSuratTugas === "MANUAL_UPLOAD" ? "Upload Manual" : "Dari Sistem",
        after: surat.sumber === "MANUAL_UPLOAD" ? "Upload Manual" : "Dari Sistem",
      });
    }
    if (surat.sumber === "MANUAL_UPLOAD" && surat.file && surat.file.name !== reg.suratTugasFile) {
      list.push({ label: "Surat Tugas", before: reg.suratTugasFile ?? "-", after: surat.file.name });
    }
    if (surat.sumber === "DIGDAYA_PERSURATAN" && surat.dokumen && surat.dokumen.documentId !== reg.dokumenSistem?.documentId) {
      list.push({ label: "Surat Tugas", before: reg.dokumenSistem?.nomorSurat ?? reg.suratTugasFile ?? "-", after: surat.dokumen.nomorSurat });
    }
    return list;
  }, [reg, admin, namaOrg, parentMwcId, village, surat, availableMwcs]);

  if (!reg) {
    return (
      <div>
        <PageHeader title="Pengajuan tidak ditemukan" subtitle="Periksa kembali nomor tiket Anda." />
        <div className="mx-auto max-w-2xl space-y-3 p-6">
          <div className="rounded-md border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            Tiket <strong>{ticketId}</strong> tidak ditemukan di sistem.
          </div>
          <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Status Pengajuan
          </Link>
        </div>
      </div>
    );
  }

  if (reg.status !== "PerluPerbaikan") {
    return (
      <div>
        <PageHeader title="Revisi Pengajuan" subtitle={`Tiket ${reg.ticketId}`} />
        <div className="mx-auto max-w-2xl space-y-3 p-6">
          <div className="rounded-md border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
            Pengajuan ini tidak sedang membutuhkan revisi.
          </div>
          <Link to={detailTo} params={{ ticketId: reg.ticketId }}>
            <Button variant="outline">Kembali ke Detail Pengajuan</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isRanting = reg.tipeOrg === "Ranting";

  const saveDraft = () => {
    toast.success("Draft revisi berhasil disimpan.");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (changes.length === 0) return toast.error("Belum ada perubahan yang dilakukan.");

    const aErr = validateAdmin(admin);
    if (aErr) return toast.error(aErr);
    const sErr = validateSuratTugas(surat);
    if (sErr) return toast.error(sErr);

    if (isRanting) {
      if (!namaOrg.trim()) return toast.error("Nama Ranting wajib diisi.");
      if (!parentMwcId) return toast.error("MWC Induk wajib dipilih.");
    }

    setBusy(true);
    await new Promise((r) => setTimeout(r, 250));
    const payload = adminToSubmit(admin);
    const parentMwcName = availableMwcs.find((m) => m.id === parentMwcId)?.nama ?? reg.parentMwcName;
    const next = actions.resubmitRevision(ticketId, {
      namaAdmin: payload.namaAdmin,
      jabatan: payload.jabatan,
      nik: payload.nik,
      hp: payload.hp,
      email: payload.email,
      sumberSuratTugas: surat.sumber,
      suratTugasFile: surat.file?.name,
      dokumenSistem: surat.dokumen ?? undefined,
      submitterEmail: user?.email,
      submitterRole: user?.role,
      ...(isRanting
        ? {
            namaOrg: namaOrg.trim(),
            parentMwcId,
            parentMwcName,
            village: village.trim() || undefined,
          }
        : {}),
    });
    setBusy(false);
    if (!next) return toast.error("Gagal mengirim revisi.");
    toast.success("Revisi berhasil dikirim.");
    navigate({ to: detailTo, params: { ticketId: reg.ticketId } });
  };

  const submitDisabled = busy || changes.length === 0;

  return (
    <div>
      <PageHeader
        title="Revisi Pengajuan"
        subtitle="Perbaiki data sesuai catatan reviewer, lalu kirim ulang untuk direview."
        breadcrumb={[
          { label: scope === "pw" ? "PWNU DI Yogyakarta" : "PCNU Kraksaan", to: scope === "pw" ? "/pw" : "/pc" },
          { label: "Status Pengajuan", to: backTo },
          { label: reg.ticketId },
          { label: "Revisi" },
        ]}
      />

      <form onSubmit={submit} className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
        {/* Catatan Reviewer */}
        <div className="rounded-xl border border-[oklch(0.82_0.12_85)] bg-[oklch(0.97_0.06_95)] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[oklch(0.55_0.16_70)]" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[oklch(0.32_0.14_70)]">Catatan Reviewer</p>
              {reg.rejectionCategory && (
                <p className="mt-1 text-xs font-medium text-[oklch(0.42_0.14_70)]">
                  Kategori: {REJECTION_CATEGORY_LABEL[reg.rejectionCategory]}
                </p>
              )}
              <p className="mt-2 text-sm text-foreground">{reg.rejectReason}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Reviewer: {reg.reviewedBy ?? "Tim Digdaya"}
                {reg.reviewedAt && <> · {new Date(reg.reviewedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</>}
              </p>
            </div>
          </div>
        </div>

        {/* Data Organisasi / Ranting */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          {isRanting ? (
            <>
              <p className="text-sm font-semibold text-foreground">Data Ranting</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Ranting boleh diedit karena belum tercatat di master data.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="mwc-parent">MWC Induk</Label>
                  <Select value={parentMwcId} onValueChange={setParentMwcId}>
                    <SelectTrigger id="mwc-parent"><SelectValue placeholder="Pilih MWC Induk" /></SelectTrigger>
                    <SelectContent>
                      {availableMwcs.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="nama-ranting">Nama Ranting</Label>
                  <Input id="nama-ranting" value={namaOrg} onChange={(e) => setNamaOrg(e.target.value)} maxLength={120} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="village">Desa/Kelurahan</Label>
                  <Input id="village" value={village} onChange={(e) => setVillage(e.target.value)} maxLength={120} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="locnote">Catatan Lokasi (opsional)</Label>
                  <Textarea id="locnote" value={locationNote} onChange={(e) => setLocationNote(e.target.value)} maxLength={300} rows={2} />
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">Data Organisasi</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Nama organisasi mengikuti master data dan tidak dapat diubah.
              </p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <Info label="Organisasi" value={reg.namaOrg} />
                <Info label="Tipe" value={reg.tipeOrg} />
                <Info label="PC Induk" value={reg.sourcePcName ?? "-"} />
                <Info label="Wilayah" value={reg.pw} />
              </dl>
            </>
          )}
        </div>

        {/* Administrator */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground">Data Administrator</p>
          <AdministratorForm value={admin} onChange={setAdmin} />
          {emailSuggestion && (
            <button
              type="button"
              onClick={() => setAdmin({ ...admin, email: emailSuggestion })}
              className="flex w-full items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-left text-xs text-foreground hover:bg-primary/10"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>
                Mungkin maksud Anda <strong className="text-primary">{emailSuggestion}</strong>? Klik untuk pakai.
              </span>
            </button>
          )}
        </div>

        {/* Surat Tugas */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3">
          <div className="flex items-start gap-3">
            <FileWarning className="mt-0.5 h-5 w-5 shrink-0 text-[oklch(0.55_0.16_70)]" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Surat Tugas</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Reviewer meminta surat tugas diperbaiki. Silakan unggah ulang surat tugas yang sesuai atau ambil dokumen yang benar dari Digdaya Persuratan.
              </p>
              {reg.suratTugasFile && (
                <p className="mt-1 text-xs text-muted-foreground">
                  File sebelumnya: <span className="font-mono text-foreground">{reg.suratTugasFile}</span>
                </p>
              )}
            </div>
          </div>
          <SuratTugasSelector value={surat} onChange={setSurat} />
        </div>

        {/* Ringkasan Revisi */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <p className="text-sm font-semibold text-foreground">Ringkasan Revisi</p>
          {changes.length === 0 ? (
            <div className="mt-3 rounded-md border border-dashed border-[oklch(0.82_0.12_85)] bg-[oklch(0.97_0.06_95)] p-3 text-xs text-[oklch(0.42_0.14_70)]">
              Belum ada perubahan yang dilakukan.
            </div>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {changes.map((c, i) => (
                <li key={i} className="rounded-md border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
                  <p className="mt-1 break-all text-xs">
                    <span className="text-muted-foreground line-through">{c.before || "-"}</span>
                    <span className="mx-2 text-muted-foreground">→</span>
                    <span className="font-medium text-foreground">{c.after || "-"}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Link to={detailTo} params={{ ticketId: reg.ticketId }} className="w-full sm:w-auto">
            <Button type="button" variant="outline" className="w-full sm:w-auto">Batal</Button>
          </Link>
          <Button type="button" variant="secondary" onClick={saveDraft} className="w-full sm:w-auto">
            Simpan Draft Revisi
          </Button>
          <Button type="submit" disabled={submitDisabled} className="w-full sm:w-auto">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kirim Revisi
          </Button>
        </div>
      </form>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[13px] font-medium text-foreground">{value}</p>
    </div>
  );
}
