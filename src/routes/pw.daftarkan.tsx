import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { actions, useStore } from "@/lib/store";
import { type TipeOrg, type Registration } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Building2, Layers, ChevronRight, ArrowLeft, Search } from "lucide-react";
import { findPwDemoTarget, pwDemoTargets, type DemoTarget } from "@/lib/demo-scope-data";
import { SuratTugasSelector, validateSuratTugas, type SuratTugasValue, emptySuratTugas } from "@/components/forms/SuratTugasSelector";
import { AdministratorForm, adminToSubmit, emptyAdminValue, validateAdmin } from "@/components/forms/AdministratorForm";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

type SectionType = "pc" | "lembaga";

export const Route = createFileRoute("/pw/daftarkan")({
  validateSearch: (search: Record<string, unknown>) => ({
    targetId: typeof search.targetId === "string" ? search.targetId : undefined,
    type: search.type === "pc" || search.type === "lembaga" ? (search.type as SectionType) : undefined,
  }),
  component: Daftarkan,
});

function Daftarkan() {
  const search = Route.useSearch();
  if (search.targetId) return <StandardForm />;
  if (search.type === "pc") return <PickerList type="PC" />;
  if (search.type === "lembaga") return <PickerList type="Lembaga PW" />;
  return <Hub />;
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

function Hub() {
  const cards = [
    {
      type: "pc" as const,
      icon: Building2,
      title: "Daftarkan PC",
      desc: "Pilih PC di bawah PWNU DI Yogyakarta yang belum production.",
      cta: "Pilih PC",
    },
    {
      type: "lembaga" as const,
      icon: Layers,
      title: "Daftarkan Lembaga PW",
      desc: "Pilih lembaga di bawah PWNU DI Yogyakarta yang belum production.",
      cta: "Pilih Lembaga",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Breadcrumb trail={[{ label: "Daftarkan Organisasi" }]} />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Daftarkan Organisasi Bawahan</h1>
          <p className="text-sm text-muted-foreground">
            Pilih jenis organisasi yang akan didaftarkan di bawah PWNU DI Yogyakarta.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((c) => (
            <div key={c.type} className="flex flex-col rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-base font-semibold text-foreground">{c.title}</p>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.desc}</p>
              <Link
                to="/pw/daftarkan"
                search={{ type: c.type }}
                className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                {c.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/pw/status-pengajuan" className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground">
            Lihat Status Pengajuan
          </Link>
          <Link to="/pw" className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground">
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

function PickerList({ type }: { type: "PC" | "Lembaga PW" }) {
  const targets = pwDemoTargets.filter((t) => t.type === type);
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

  const title = type === "PC" ? "Pilih PC" : "Pilih Lembaga PW";
  const subtitle =
    type === "PC"
      ? "Pilih PC di bawah PWNU DI Yogyakarta yang akan didaftarkan."
      : "Pilih lembaga di bawah PWNU DI Yogyakarta yang akan didaftarkan.";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Breadcrumb
          trail={[
            { label: "Daftarkan Organisasi", to: "/pw/daftarkan" },
            { label: title },
          ]}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Link to="/pw/daftarkan" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Pilihan
          </Link>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Cari ${type}...`} className="pl-9" />
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
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:w-auto"
          >
            Daftarkan
          </Link>
        )}
        {state === "Pending" && reg && (
          <Link
            to="/pw/status-pengajuan/$ticketId"
            params={{ ticketId: reg.ticketId }}
            className="inline-flex w-full items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground sm:w-auto"
          >
            Lihat Status
          </Link>
        )}
        {state === "PerluPerbaikan" && reg && (
          <Link
            to="/pw/status-pengajuan/$ticketId/revisi"
            params={{ ticketId: reg.ticketId }}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:w-auto"
          >
            Perbaiki
          </Link>
        )}
        {state === "Production" && (
          <span className="inline-flex w-full items-center justify-center rounded-md bg-success/15 px-4 py-2 text-sm font-medium text-success sm:w-auto">
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

  if (!target) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <Breadcrumb trail={[{ label: "Daftarkan Organisasi", to: "/pw/daftarkan" }, { label: "Tidak Ditemukan" }]} />
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Organisasi tidak ditemukan. Silakan kembali ke pilihan.
          </div>
          <Link to="/pw/daftarkan" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Kembali ke Pilihan
          </Link>
        </div>
      </div>
    );
  }

  const backType: SectionType = target.type === "PC" ? "pc" : "lembaga";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const aErr = validateAdmin(admin);
    if (aErr) return toast.error(aErr);
    const sErr = validateSuratTugas(surat);
    if (sErr) return toast.error(sErr);

    setBusy(true);
    await new Promise((r) => setTimeout(r, 400));
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Breadcrumb
          trail={[
            { label: "Daftarkan Organisasi", to: "/pw/daftarkan" },
            { label: target.type === "PC" ? "Pilih PC" : "Pilih Lembaga PW", to: "/pw/daftarkan", search: { type: backType } },
            { label: target.name },
          ]}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Daftarkan {target.name}</h1>
            <p className="text-sm text-muted-foreground">Lengkapi data administrator dan surat tugas.</p>
          </div>
          <Link to="/pw/daftarkan" search={{ type: backType }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
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
            <Link to="/pw/daftarkan" search={{ type: backType }} className="inline-flex w-full items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground sm:w-auto">
              Kembali ke Pilihan
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
