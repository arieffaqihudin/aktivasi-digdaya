import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { actions, useStore } from "@/lib/store";
import { type TipeOrg, type Registration } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Info as InfoIcon, Building2, Layers, Sprout, ChevronRight, ArrowLeft, Search } from "lucide-react";
import { findPcDemoTarget, pcDemoTargets, kraksaanMwcOptions, findKraksaanMwc, type DemoTarget } from "@/lib/demo-scope-data";
import { SuratTugasSelector, validateSuratTugas, type SuratTugasValue, emptySuratTugas } from "@/components/forms/SuratTugasSelector";
import { AdministratorForm, adminToSubmit, emptyAdminValue, validateAdmin } from "@/components/forms/AdministratorForm";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";


type SectionType = "mwc" | "lembaga" | "ranting";

export const Route = createFileRoute("/pc/daftarkan")({
  validateSearch: (search: Record<string, unknown>) => ({
    targetId: typeof search.targetId === "string" ? search.targetId : undefined,
    type:
      search.type === "mwc" || search.type === "lembaga" || search.type === "ranting"
        ? (search.type as SectionType)
        : undefined,
  }),
  component: Daftarkan,
});

function Daftarkan() {
  const search = Route.useSearch();
  if (search.targetId) return <StandardForm />;
  if (search.type === "ranting") return <RantingForm />;
  if (search.type === "mwc") return <PickerList type="MWC" />;
  if (search.type === "lembaga") return <PickerList type="Lembaga PC" />;
  return <Hub />;
}

// ============= Breadcrumb =============
function Breadcrumb({ trail }: { trail: { label: string; to?: string; search?: Record<string, string> }[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      <Link to="/pc" className="hover:text-foreground">PCNU Kraksaan</Link>
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

// ============= Hub: 3 cards =============
function Hub() {
  const cards = [
    {
      type: "mwc" as const,
      icon: Building2,
      title: "Daftarkan MWC",
      desc: "Pilih MWC di bawah PCNU Kraksaan yang belum production.",
      cta: "Pilih MWC",
    },
    {
      type: "lembaga" as const,
      icon: Layers,
      title: "Daftarkan Lembaga PC",
      desc: "Pilih lembaga di bawah PCNU Kraksaan yang belum production.",
      cta: "Pilih Lembaga",
    },
    {
      type: "ranting" as const,
      icon: Sprout,
      title: "Daftarkan Ranting",
      desc: "Input manual Ranting di bawah MWC karena master data Ranting belum tersedia terpusat.",
      cta: "Tambah Ranting",
    },
  ];

  return (
    <div className="p-4 pb-24 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <Breadcrumb trail={[{ label: "Daftarkan Organisasi" }]} />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Daftarkan Organisasi Bawahan</h1>
          <p className="text-sm text-muted-foreground">
            Pilih jenis organisasi yang akan didaftarkan.
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.type}
              to="/pc/daftarkan"
              search={{ type: c.type }}
              className="flex flex-col rounded-xl border border-border bg-card p-4 active:bg-accent/40 sm:p-5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-base font-semibold text-foreground">{c.title}</p>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
              <span className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground sm:py-2.5">
                {c.cta}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          <Link to="/pc/status-pengajuan" className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground sm:h-auto sm:py-2">
            Lihat Status Pengajuan
          </Link>
          <Link to="/pc" className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-muted-foreground sm:h-auto sm:py-2">
            Kembali ke Overview
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============= Picker (MWC / Lembaga PC) =============
function useLatestRegByName() {
  const regs = useStore((s) => s.registrations);
  return useMemo(() => {
    const map = new Map<string, Registration>();
    for (const r of regs) {
      if (r.sumberPengajuan !== "PC_DASHBOARD") continue;
      const prev = map.get(r.namaOrg);
      if (!prev || new Date(r.submittedAt) > new Date(prev.submittedAt)) map.set(r.namaOrg, r);
    }
    return map;
  }, [regs]);
}

function PickerList({ type }: { type: "MWC" | "Lembaga PC" }) {
  const targets = pcDemoTargets.filter((t) => t.type === type);
  const latest = useLatestRegByName();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"ALL" | "Belum Production" | "Pending" | "PerluPerbaikan" | "Production">("ALL");

  const enriched = targets.map((t) => {
    const reg = latest.get(t.name);
    let state: "Belum Production" | "Pending" | "PerluPerbaikan" | "Production" = "Belum Production";
    if (reg?.status === "Approved") state = "Production";
    else if (reg?.status === "Pending") state = "Pending";
    else if (reg?.status === "PerluPerbaikan") state = "PerluPerbaikan";
    return { t, reg, state };
  });

  const filtered = enriched.filter((e) => {
    if (q && !e.t.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter !== "ALL" && e.state !== filter) return false;
    return true;
  });

  const title = type === "MWC" ? "Pilih MWC" : "Pilih Lembaga PC";
  const subtitle =
    type === "MWC"
      ? "Pilih MWC di bawah PCNU Kraksaan yang akan didaftarkan."
      : "Pilih lembaga di bawah PCNU Kraksaan yang akan didaftarkan.";

  const filters: typeof filter[] = ["ALL", "Belum Production", "Pending", "PerluPerbaikan", "Production"];
  const filterLabel: Record<typeof filter, string> = {
    ALL: "Semua",
    "Belum Production": "Belum Production",
    Pending: "Pending Review",
    PerluPerbaikan: "Perlu Perbaikan",
    Production: "Sudah Production",
  };

  return (
    <div className="p-4 pb-24 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <Breadcrumb
          trail={[
            { label: "Daftarkan Organisasi", to: "/pc/daftarkan" },
            { label: title },
          ]}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Link to="/pc/daftarkan" className="inline-flex h-10 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground sm:h-auto">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Pilihan
          </Link>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Cari ${type}...`} className="h-11 pl-9 text-base sm:h-10 sm:text-sm" />
          </div>
          <div className="-mx-1 flex w-full overflow-x-auto pb-1">
            <div className="inline-flex w-max gap-2 px-1">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-3 py-2 text-sm sm:py-1.5",
                    filter === f
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {filterLabel[f]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            {enriched.every((e) => e.state === "Production")
              ? `Semua ${type === "MWC" ? "MWC" : "Lembaga PC"} sudah production.`
              : "Tidak ada hasil."}
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
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
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
            to="/pc/daftarkan"
            search={{ targetId: target.id }}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:w-auto"
          >
            Daftarkan
          </Link>
        )}
        {state === "Pending" && reg && (
          <Link
            to="/pc/status-pengajuan/$ticketId"
            params={{ ticketId: reg.ticketId }}
            className="inline-flex w-full items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground sm:w-auto"
          >
            Lihat Status
          </Link>
        )}
        {state === "PerluPerbaikan" && reg && (
          <Link
            to="/pc/status-pengajuan/$ticketId/revisi"
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

// ============= Ranting form =============
function RantingForm() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const [parentMwcId, setParentMwcId] = useState("");
  const [namaRanting, setNamaRanting] = useState("");
  const [village, setVillage] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [admin, setAdmin] = useState(emptyAdminValue());
  const [surat, setSurat] = useState<SuratTugasValue>(emptySuratTugas("full"));
  const [busy, setBusy] = useState(false);

  const parent = findKraksaanMwc(parentMwcId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parent) return toast.error("Pilih MWC induk terlebih dahulu.");
    if (!namaRanting.trim()) return toast.error("Nama Ranting wajib diisi.");
    const aErr = validateAdmin(admin);
    if (aErr) return toast.error(aErr);
    const sErr = validateSuratTugas(surat);
    if (sErr) return toast.error(sErr);

    setBusy(true);
    await new Promise((r) => setTimeout(r, 400));
    const a = adminToSubmit(admin);
    const reg = actions.submitRanting({
      namaRanting: namaRanting.trim(),
      parentMwcId: parent.id,
      parentMwcName: parent.name,
      village: village.trim() || undefined,
      locationNote: locationNote.trim() || undefined,
      namaAdmin: a.namaAdmin, jabatan: a.jabatan, nik: a.nik, hp: a.hp, email: a.email,
      sumberSuratTugas: surat.sumber,
      suratTugasFile: surat.file?.name,
      dokumenSistem: surat.dokumen ?? undefined,
    });
    setBusy(false);
    if (!reg) return toast.error("Gagal mengirim pengajuan.");
    toast.success("Pengajuan aktivasi Ranting berhasil dikirim.");
    navigate({ to: "/pc/status-pengajuan" });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Breadcrumb
          trail={[
            { label: "Daftarkan Organisasi", to: "/pc/daftarkan" },
            { label: "Daftarkan Ranting" },
          ]}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Daftarkan Ranting</h1>
            <p className="text-sm text-muted-foreground">
              Input data Ranting di bawah {user?.pcName ?? "PCNU Kraksaan"}.
            </p>
          </div>
          <Link to="/pc/daftarkan" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Pilihan
          </Link>
        </div>

        <div className="flex items-start gap-3 rounded-md border border-info/30 bg-info/5 p-4 text-sm text-foreground">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-info" />
          <p>
            Karena master data Ranting belum tersedia terpusat, nama Ranting diinput manual oleh PC/MWC dan akan diverifikasi berdasarkan surat tugas.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <p className="text-sm font-semibold text-foreground">Data Ranting</p>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">MWC Induk</Label>
              <Select value={parentMwcId} onValueChange={setParentMwcId}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Pilih MWC induk" /></SelectTrigger>
                <SelectContent>
                  {kraksaanMwcOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nama Ranting</Label>
              <Input value={namaRanting} onChange={(e) => setNamaRanting(e.target.value)} placeholder="Contoh: Ranting NU Banyuanyar Tengah" className="mt-1.5 h-10" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Desa / Kelurahan (opsional)</Label>
              <Input value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Contoh: Desa Banyuanyar Tengah" className="mt-1.5 h-10" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Catatan Lokasi (opsional)</Label>
              <Textarea value={locationNote} onChange={(e) => setLocationNote(e.target.value)} className="mt-1.5" rows={2} />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <AdministratorForm value={admin} onChange={setAdmin} />
          </section>

          <section className="rounded-xl border border-border bg-card p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground">Surat Tugas</p>
            <SuratTugasSelector value={surat} onChange={setSurat} mode="full" />
          </section>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Link to="/pc/daftarkan" className="inline-flex w-full items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground sm:w-auto">
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

// ============= Standard form (MWC / Lembaga PC by targetId) =============
function StandardForm() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(emptyAdminValue());
  const [surat, setSurat] = useState<SuratTugasValue>(emptySuratTugas("full"));
  const [busy, setBusy] = useState(false);

  const target = findPcDemoTarget(search.targetId);

  if (!target) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <Breadcrumb trail={[{ label: "Daftarkan Organisasi", to: "/pc/daftarkan" }, { label: "Tidak Ditemukan" }]} />
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Organisasi tidak ditemukan. Silakan kembali ke pilihan.
          </div>
          <Link to="/pc/daftarkan" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Kembali ke Pilihan
          </Link>
        </div>
      </div>
    );
  }

  const backType: SectionType = target.type === "MWC" ? "mwc" : "lembaga";

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
    navigate({ to: "/pc/status-pengajuan" });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Breadcrumb
          trail={[
            { label: "Daftarkan Organisasi", to: "/pc/daftarkan" },
            { label: target.type === "MWC" ? "Pilih MWC" : "Pilih Lembaga PC", to: "/pc/daftarkan", search: { type: backType } },
            { label: target.name },
          ]}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Daftarkan {target.name}</h1>
            <p className="text-sm text-muted-foreground">Lengkapi data administrator dan surat tugas.</p>
          </div>
          <Link to="/pc/daftarkan" search={{ type: backType }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <section className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">Data Organisasi</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoBlock label="Nama Organisasi" value={target.name} />
              <InfoBlock label="Tipe Organisasi" value={target.type} />
              <InfoBlock label="Induk" value="PCNU Kraksaan" />
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
            <Link to="/pc/daftarkan" search={{ type: backType }} className="inline-flex w-full items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground sm:w-auto">
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
