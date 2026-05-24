import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { actions, useStore } from "@/lib/store";
import { type TipeOrg, type Registration } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isValidNIK, isValidEmail, normalizePhone, isValidPhone } from "@/utils/validation";
import { toast } from "sonner";
import { Loader2, Info as InfoIcon, Building2, Layers, Sprout, ChevronRight, ArrowLeft, Search } from "lucide-react";
import { findPcDemoTarget, pcDemoTargets, kraksaanMwcOptions, findKraksaanMwc, type DemoTarget } from "@/lib/demo-scope-data";
import { SuratTugasPicker, validateSuratTugas, type SuratTugasValue } from "@/components/internal/SuratTugasPicker";
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Breadcrumb trail={[{ label: "Daftarkan Organisasi" }]} />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Daftarkan Organisasi Bawahan</h1>
          <p className="text-sm text-muted-foreground">
            Pilih jenis organisasi yang akan didaftarkan di bawah PCNU Kraksaan.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <div key={c.type} className="flex flex-col rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-base font-semibold text-foreground">{c.title}</p>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.desc}</p>
              <Link
                to="/pc/daftarkan"
                search={{ type: c.type }}
                className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                {c.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/pc/status-pengajuan" className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground">
            Lihat Status Pengajuan
          </Link>
          <Link to="/pc" className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground">
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Breadcrumb
          trail={[
            { label: "Daftarkan Organisasi", to: "/pc/daftarkan" },
            { label: title },
          ]}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Link to="/pc/daftarkan" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Pilihan
          </Link>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Cari ${type}...`} className="pl-9" />
          </div>
          <div className="-mx-1 flex w-full overflow-x-auto">
            <div className="inline-flex w-max gap-2 px-1">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm",
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
  const [namaAdmin, setNamaAdmin] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [nik, setNik] = useState("");
  const [hp, setHp] = useState("");
  const [email, setEmail] = useState("");
  const [surat, setSurat] = useState<SuratTugasValue>({ sumber: "DIGDAYA_PERSURATAN", dokumen: null, file: null });
  const [busy, setBusy] = useState(false);

  const parent = findKraksaanMwc(parentMwcId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parent) return toast.error("Pilih MWC induk terlebih dahulu.");
    if (!namaRanting.trim()) return toast.error("Nama Ranting wajib diisi.");
    if (!namaAdmin.trim() || !jabatan.trim()) return toast.error("Lengkapi data administrator.");
    if (!isValidNIK(nik)) return toast.error("NIK harus 16 digit.");
    if (!isValidEmail(email)) return toast.error("Email tidak valid.");
    const normHp = normalizePhone(hp);
    if (!isValidPhone(normHp)) return toast.error("Nomor HP tidak valid.");
    const sErr = validateSuratTugas(surat);
    if (sErr) return toast.error(sErr);

    setBusy(true);
    await new Promise((r) => setTimeout(r, 400));
    const reg = actions.submitRanting({
      namaRanting: namaRanting.trim(),
      parentMwcId: parent.id,
      parentMwcName: parent.name,
      village: village.trim() || undefined,
      locationNote: locationNote.trim() || undefined,
      namaAdmin,
      jabatan,
      nik,
      hp: normHp,
      email,
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
              Input data Ranting di bawah {user?.pcName ?? "PCNU Kraksaan"}. Data ini akan menjadi dasar master data Ranting setelah diverifikasi.
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

            <Field label="Nama Ranting" value={namaRanting} onChange={setNamaRanting} placeholder="Contoh: Ranting NU Banyuanyar Tengah" />
            <Field label="Desa / Kelurahan (opsional)" value={village} onChange={setVillage} required={false} placeholder="Contoh: Desa Banyuanyar Tengah" />
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Catatan Lokasi (opsional)</Label>
              <Textarea value={locationNote} onChange={(e) => setLocationNote(e.target.value)} className="mt-1.5" rows={2} />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <p className="text-sm font-semibold text-foreground">Data Administrator</p>
            <Field label="Nama Administrator" value={namaAdmin} onChange={setNamaAdmin} />
            <Field label="Jabatan Administrator" value={jabatan} onChange={setJabatan} />
            <Field label="NIK (16 digit)" value={nik} onChange={(v) => setNik(v.replace(/\D/g, "").slice(0, 16))} />
            <Field label="Nomor HP WhatsApp" value={hp} onChange={setHp} placeholder="08xxxxxxxxxx" />
            <Field label="Email" value={email} onChange={setEmail} type="email" />
          </section>

          <section className="rounded-xl border border-border bg-card p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground">Surat Tugas</p>
            <SuratTugasPicker value={surat} onChange={setSurat} />
          </section>

          {parent && namaRanting && (
            <section className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground">Konfirmasi</p>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <Info label="Nama Ranting" value={namaRanting} />
                <Info label="MWC Induk" value={parent.name} />
                <Info label="PC Induk" value={user?.pcName ?? "PCNU Kraksaan"} />
                {village && <Info label="Desa / Kelurahan" value={village} />}
                <Info label="Nama Administrator" value={namaAdmin || "—"} />
                <Info label="Jabatan" value={jabatan || "—"} />
                <Info label="NIK" value={nik ? `${nik.slice(0, 4)}••••••••${nik.slice(-2)}` : "—"} />
                <Info label="Nomor HP" value={hp || "—"} />
                <Info label="Email" value={email || "—"} />
                <Info label="Sumber Surat Tugas" value={surat.sumber === "DIGDAYA_PERSURATAN" ? "Digdaya Persuratan" : "Upload Manual"} />
              </dl>
            </section>
          )}

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
  const [tipeSurat, setTipeSurat] = useState<"DIGDAYA_PERSURATAN" | "MANUAL_UPLOAD">("DIGDAYA_PERSURATAN");
  const [namaAdmin, setNamaAdmin] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [nik, setNik] = useState("");
  const [hp, setHp] = useState("");
  const [email, setEmail] = useState("");
  const [suratValue, setSuratValue] = useState("");
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
    if (!namaAdmin.trim() || !jabatan.trim()) { toast.error("Lengkapi data administrator."); return; }
    if (!isValidNIK(nik)) { toast.error("NIK harus 16 digit."); return; }
    if (!isValidEmail(email)) { toast.error("Email tidak valid."); return; }
    const normHp = normalizePhone(hp);
    if (!isValidPhone(normHp)) { toast.error("Nomor HP tidak valid."); return; }
    if (!suratValue.trim()) { toast.error("Lengkapi surat tugas."); return; }
    setBusy(true); await new Promise((r) => setTimeout(r, 500));
    const reg = actions.submitInternal({
      tipeOrg: target.type as TipeOrg,
      namaOrg: target.name,
      namaAdmin, jabatan, nik, hp: normHp, email,
      sumberSuratTugas: tipeSurat,
      suratTugasFile: tipeSurat === "MANUAL_UPLOAD" ? suratValue : undefined,
      dokumenSistem: tipeSurat === "DIGDAYA_PERSURATAN" ? {
        documentId: `DOC-${target.id}`,
        nomorSurat: suratValue,
        namaDokumen: `Surat Tugas ${target.name}`,
        tanggalSurat: new Date().toISOString().slice(0, 10),
        penandatangan: "Ketua PCNU Kraksaan",
        status: "Tertandatangani",
      } : undefined,
    });
    setBusy(false);
    if (!reg) { toast.error("Gagal mengirim."); return; }
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
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">Data Organisasi</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info label="Nama Organisasi" value={target.name} />
              <Info label="Tipe Organisasi" value={target.type} />
              <Info label="Induk" value="PCNU Kraksaan" />
              <Info label="Status" value="Belum Production" />
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <p className="text-sm font-semibold text-foreground">Data Administrator</p>
            <Field label="Nama Administrator" value={namaAdmin} onChange={setNamaAdmin} />
            <Field label="Jabatan Administrator" value={jabatan} onChange={setJabatan} />
            <Field label="NIK" value={nik} onChange={(v) => setNik(v.replace(/\D/g, "").slice(0,16))} />
            <Field label="Nomor HP WhatsApp" value={hp} onChange={setHp} placeholder="08xxxxxxxxxx" />
            <Field label="Email" value={email} onChange={setEmail} type="email" />
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <p className="text-sm font-semibold text-foreground">Surat Tugas</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => { setTipeSurat("DIGDAYA_PERSURATAN"); setSuratValue(""); }} className={tipeSurat === "DIGDAYA_PERSURATAN" ? "rounded-md border border-primary bg-secondary px-3 py-2 text-sm font-medium text-foreground" : "rounded-md border border-border px-3 py-2 text-sm text-muted-foreground"}>
                Ambil dari Digdaya Persuratan
              </button>
              <button type="button" onClick={() => { setTipeSurat("MANUAL_UPLOAD"); setSuratValue(""); }} className={tipeSurat === "MANUAL_UPLOAD" ? "rounded-md border border-primary bg-secondary px-3 py-2 text-sm font-medium text-foreground" : "rounded-md border border-border px-3 py-2 text-sm text-muted-foreground"}>
                Upload Surat Tugas Baru
              </button>
            </div>
            <Field
              label={tipeSurat === "DIGDAYA_PERSURATAN" ? "Nomor surat" : "Nama file surat tugas"}
              value={suratValue}
              onChange={setSuratValue}
              placeholder={tipeSurat === "DIGDAYA_PERSURATAN" ? "Contoh: 014/PC-KRK/ST/2026" : "Contoh: surat-tugas.pdf"}
            />
          </div>

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

function Field({ label, value, onChange, type = "text", placeholder, required = true }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1.5" required={required} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1.5 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground">{value}</div>
    </div>
  );
}
