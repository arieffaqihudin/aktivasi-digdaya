import { createFileRoute, Link, useNavigate, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { actions, useStore } from "@/lib/store";
import { type TipeOrg, type Registration } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Layers, FileSpreadsheet, ChevronRight, ArrowLeft, Search } from "lucide-react";
import { findPwDemoTarget, pwDemoTargets, type DemoTarget } from "@/lib/demo-scope-data";
import { SuratTugasSelector, validateSuratTugas, type SuratTugasValue, emptySuratTugas } from "@/components/forms/SuratTugasSelector";
import { AdministratorForm, adminToSubmit, emptyAdminValue, validateAdmin } from "@/components/forms/AdministratorForm";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

type SectionType = "lembaga";

export const Route = createFileRoute("/pw/daftarkan")({
  validateSearch: (search: Record<string, unknown>) => ({
    targetId: typeof search.targetId === "string" ? search.targetId : undefined,
    // Hanya "lembaga" yang valid. Nilai lain (mis. "pc") akan diabaikan & user diarahkan ke hub.
    type: search.type === "lembaga" ? ("lembaga" as SectionType) : undefined,
    invalidType: search.type === "pc" ? true : undefined,
  }),
  component: Daftarkan,
});

function Daftarkan() {
  const search = Route.useSearch();

  // Guard: jika targetId merujuk ke organisasi non-Lembaga PW (mis. PC lama), redirect ke hub.
  if (search.targetId) {
    const target = findPwDemoTarget(search.targetId);
    if (!target || target.type !== "Lembaga PW") {
      return <Navigate to="/pw/daftarkan" replace />;
    }
    return <StandardForm />;
  }
  if (search.type === "lembaga") return <PickerList />;
  return <Hub showPwOnlyNotice={search.invalidType === true} />;
}

function Breadcrumb({ trail }: { trail: { label: string; to?: string; search?: Record<string, string> }[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      <Link to="/pw" className="hover:text-foreground">PWNU DI Yogyakarta</Link>
      {trail.map((t, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {t.to ? (
            <Link to={t.to} search={t.search as never} className="hover:text-foreground">{t.label}</Link>
          ) : (
            <span className="text-foreground">{t.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function Hub({ showPwOnlyNotice }: { showPwOnlyNotice?: boolean }) {
  return (
    <div className="p-4 pb-24 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <Breadcrumb trail={[{ label: "Daftarkan Lembaga" }]} />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Daftarkan Lembaga PW</h1>
          <p className="text-sm text-muted-foreground">
            PW hanya dapat mendaftarkan Lembaga di bawah PWNU. Pilih satu per satu atau import banyak sekaligus dari Excel.
          </p>
        </div>

        {showPwOnlyNotice && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">
            PW hanya dapat mendaftarkan Lembaga PW melalui halaman ini. Pendaftaran PC dilakukan oleh PC sendiri.
          </div>
        )}

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <Link
            to="/pw/daftarkan"
            search={{ type: "lembaga" }}
            className="flex flex-col rounded-xl border border-border bg-card p-4 active:bg-accent/40 sm:p-5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <p className="mt-3 text-base font-semibold text-foreground">Daftarkan Lembaga PW</p>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
              Pilih lembaga di bawah PWNU yang akan didaftarkan ke Digdaya.
            </p>
            <span className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground sm:py-2.5">
              Pilih Lembaga
            </span>
          </Link>

          <Link
            to="/pw/daftarkan/import"
            className="flex flex-col rounded-xl border border-primary/30 bg-primary/5 p-4 active:bg-accent/40 sm:p-5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <p className="mt-3 text-base font-semibold text-foreground">Import Data Administrator</p>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
              Upload Excel untuk mendaftarkan banyak Lembaga PW sekaligus.
            </p>
            <span className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-primary bg-card px-4 py-3 text-sm font-semibold text-primary sm:py-2.5">
              Import Excel
            </span>
          </Link>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          <Link to="/pw/status-pengajuan" className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground sm:h-auto sm:py-2">
            Lihat Status Pengajuan
          </Link>
          <Link to="/pw" className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-muted-foreground sm:h-auto sm:py-2">
            Kembali ke Overview
          </Link>
        </div>
      </div>
    </div>
  );
}

function useLatestRegByName() {
  const regs = useStore((s) => s.registrations);
  return useMemo(() => {
    const map = new Map<string, Registration>();
    for (const r of regs) {
      if (r.sumberPengajuan !== "PW_DASHBOARD") continue;
      const prev = map.get(r.namaOrg);
      if (!prev || new Date(r.submittedAt) > new Date(prev.submittedAt)) map.set(r.namaOrg, r);
    }
    return map;
  }, [regs]);
}

function PickerList() {
  const targets = pwDemoTargets.filter((t) => t.type === "Lembaga PW");
  const latest = useLatestRegByName();
  const [q, setQ] = useState("");

  const enriched = targets.map((t) => {
    const reg = latest.get(t.name);
    let state: "Belum Production" | "Pending" | "PerluPerbaikan" | "Production" = "Belum Production";
    if (reg?.status === "Approved") state = "Production";
    else if (reg?.status === "Pending") state = "Pending";
    else if (reg?.status === "PerluPerbaikan") state = "PerluPerbaikan";
    return { t, reg, state };
  });

  const filtered = enriched.filter((e) => !q || e.t.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-4 pb-24 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <Breadcrumb
          trail={[
            { label: "Daftarkan Lembaga", to: "/pw/daftarkan" },
            { label: "Pilih Lembaga PW" },
          ]}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Pilih Lembaga PW</h1>
            <p className="text-sm text-muted-foreground">Pilih lembaga di bawah PWNU yang akan didaftarkan.</p>
          </div>
          <Link to="/pw/daftarkan" className="inline-flex h-10 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground sm:h-auto">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari Lembaga PW..." className="h-11 pl-9 text-base sm:h-10 sm:text-sm" />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Tidak ada hasil.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(({ t, reg, state }) => (
              <PickerCard key={t.id} target={t} reg={reg} state={state} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PickerCard({
  target,
  reg,
  state,
}: {
  target: DemoTarget;
  reg?: Registration;
  state: "Belum Production" | "Pending" | "PerluPerbaikan" | "Production";
}) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between")}>
      <div className="min-w-0">
        <p className="font-medium text-foreground">{target.name}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{target.type}</p>
        <div className="mt-2">
          {reg ? (
            <StatusBadge status={reg.status} />
          ) : (
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              Belum Production
            </span>
          )}
        </div>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        {state === "Belum Production" && (
          <Link
            to="/pw/daftarkan"
            search={{ targetId: target.id }}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground sm:h-10 sm:w-auto sm:rounded-md"
          >
            Daftarkan
          </Link>
        )}
        {state === "Pending" && reg && (
          <Link
            to="/pw/status-pengajuan/$ticketId"
            params={{ ticketId: reg.ticketId }}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground sm:h-10 sm:w-auto sm:rounded-md"
          >
            Lihat Status
          </Link>
        )}
        {state === "PerluPerbaikan" && reg && (
          <Link
            to="/pw/status-pengajuan/$ticketId/revisi"
            params={{ ticketId: reg.ticketId }}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground sm:h-10 sm:w-auto sm:rounded-md"
          >
            Perbaiki
          </Link>
        )}
        {state === "Production" && (
          <span className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-success/15 px-4 text-sm font-medium text-success sm:h-10 sm:w-auto sm:rounded-md">
            Sudah Production
          </span>
        )}
      </div>
    </div>
  );
}

function StandardForm() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(emptyAdminValue());
  const [surat, setSurat] = useState<SuratTugasValue>(emptySuratTugas("full"));
  const [busy, setBusy] = useState(false);

  const target = findPwDemoTarget(search.targetId);
  if (!target) return <Navigate to="/pw/daftarkan" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const aErr = validateAdmin(admin);
    if (aErr) return toast.error(aErr);
    const sErr = validateSuratTugas(surat);
    if (sErr) return toast.error(sErr);

    setBusy(true);
    await new Promise((r) => setTimeout(r, 250));
    const a = adminToSubmit(admin);
    const reg = actions.submitInternal({
      tipeOrg: target.type as TipeOrg,
      namaOrg: target.name,
      namaAdmin: a.namaAdmin,
      jabatan: a.jabatan,
      nik: a.nik,
      hp: a.hp,
      email: a.email,
      sumberSuratTugas: surat.sumber,
      suratTugasFile: surat.file?.name,
      dokumenSistem: surat.dokumen ?? undefined,
    });
    setBusy(false);
    if (!reg) return toast.error("Gagal mengirim pengajuan.");
    toast.success(`Pengajuan dikirim. Tiket: ${reg.ticketId}`);
    navigate({ to: "/pw/status-pengajuan" });
  };

  return (
    <div className="p-4 pb-24 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <Breadcrumb
          trail={[
            { label: "Daftarkan Lembaga", to: "/pw/daftarkan" },
            { label: "Pilih Lembaga PW", to: "/pw/daftarkan", search: { type: "lembaga" } },
            { label: target.name },
          ]}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Daftarkan {target.name}</h1>
            <p className="text-sm text-muted-foreground">Lengkapi data administrator dan surat tugas.</p>
          </div>
          <Link to="/pw/daftarkan" search={{ type: "lembaga" }} className="inline-flex h-10 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground sm:h-auto">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <section className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">Data Organisasi</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoBlock label="Nama Organisasi" value={target.name} />
              <InfoBlock label="Tipe Organisasi" value={target.type} />
              <InfoBlock label="Induk" value="PWNU DI Yogyakarta" />
              <InfoBlock label="Status" value="Belum Production" />
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <AdministratorForm value={admin} onChange={setAdmin} />
          </section>

          <section className="rounded-xl border border-border bg-card p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground">Surat Tugas</p>
            <SuratTugasSelector value={surat} onChange={setSurat} mode="full" />
          </section>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Link to="/pw/daftarkan" search={{ type: "lembaga" }} className="inline-flex w-full items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground sm:w-auto">
              Kembali
            </Link>
            <Button type="submit" disabled={busy} className="w-full sm:w-auto">
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim Pengajuan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1.5 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground">{value}</div>
    </div>
  );
}
