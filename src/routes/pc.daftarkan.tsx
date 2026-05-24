import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { actions, useStore } from "@/lib/store";
import { type TipeOrg } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isValidNIK, isValidEmail, normalizePhone, isValidPhone } from "@/utils/validation";
import { toast } from "sonner";
import { Loader2, Info as InfoIcon } from "lucide-react";
import { findPcDemoTarget, pcDemoTargets, kraksaanMwcOptions, findKraksaanMwc } from "@/lib/demo-scope-data";
import { SuratTugasPicker, validateSuratTugas, type SuratTugasValue } from "@/components/internal/SuratTugasPicker";

export const Route = createFileRoute("/pc/daftarkan")({
  validateSearch: (search: Record<string, unknown>) => ({
    targetId: typeof search.targetId === "string" ? search.targetId : undefined,
    type: search.type === "ranting" ? ("ranting" as const) : undefined,
  }),
  component: Daftarkan,
});

function Daftarkan() {
  const search = Route.useSearch();
  if (search.type === "ranting") return <RantingForm />;
  return <StandardForm />;
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
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Daftarkan Ranting</h1>
          <p className="text-sm text-muted-foreground">
            Input data Ranting di bawah {user?.pcName ?? "PCNU Kraksaan"}, lalu lengkapi data administrator untuk proses aktivasi.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-md border border-info/30 bg-info/5 p-4 text-sm text-foreground">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-info" />
          <p>
            Data Ranting belum tersedia di master data terpusat. Input ini akan menjadi cikal-bakal master data Ranting di Digdaya setelah diverifikasi.
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

            <Field label="Nama Ranting" value={namaRanting} onChange={setNamaRanting} placeholder="Contoh: Ranting NU Desa A" />
            <Field label="Wilayah / Desa / Kelurahan (opsional)" value={village} onChange={setVillage} required={false} placeholder="Contoh: Desa Banyuanyar Tengah" />
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
                {village && <Info label="Wilayah / Desa" value={village} />}
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
            <Link to="/pc" className="inline-flex w-full items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground sm:w-auto">
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

// ============= Standard form (MWC / Lembaga PC) =============
function StandardForm() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const registrations = useStore((s) => s.registrations);
  const [tipeSurat, setTipeSurat] = useState<"DIGDAYA_PERSURATAN" | "MANUAL_UPLOAD">("DIGDAYA_PERSURATAN");
  const [namaAdmin, setNamaAdmin] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [nik, setNik] = useState("");
  const [hp, setHp] = useState("");
  const [email, setEmail] = useState("");
  const [suratValue, setSuratValue] = useState("");
  const [busy, setBusy] = useState(false);

  const target = findPcDemoTarget(search.targetId);
  const history = useMemo(
    () => registrations.filter((r) => r.sumberPengajuan === "PC_DASHBOARD").slice(0, 5),
    [registrations],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) { toast.error("Pilih organisasi terlebih dahulu."); return; }
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
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Daftarkan Organisasi Bawahan</h1>
          <p className="text-sm text-muted-foreground">Lengkapi data administrator dan surat tugas untuk target yang dipilih.</p>
        </div>

        {!target ? (
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">Pilih organisasi</h2>
              <p className="text-sm text-muted-foreground">Pilih salah satu target di bawah ini.</p>
            </div>
            <div className="space-y-3">
              {pcDemoTargets.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.type}</p>
                  </div>
                  <Link to="/pc/daftarkan" search={{ targetId: item.id }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                    Pilih
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground">Data organisasi</p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <Info label="Organisasi" value={target.name} />
                <Info label="Tipe" value={target.type} />
              </dl>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <p className="text-sm font-semibold text-foreground">Data administrator</p>
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
                  Upload Manual
                </button>
              </div>
              <Field
                label={tipeSurat === "DIGDAYA_PERSURATAN" ? "Nomor surat" : "Nama file surat tugas"}
                value={suratValue}
                onChange={setSuratValue}
                placeholder={tipeSurat === "DIGDAYA_PERSURATAN" ? "Contoh: 014/PC-KRK/ST/2026" : "Contoh: surat-tugas-mwc-banyuanyar.pdf"}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kirim Pengajuan
              </Button>
              <Link to="/pc/status-pengajuan" className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground">
                Lihat Status Pengajuan
              </Link>
            </div>
          </form>
        )}

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">Pengajuan terbaru</h2>
          <div className="mt-4 space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada pengajuan.</p>
            ) : (
              history.map((item) => (
                <div key={item.ticketId} className="rounded-lg border border-border p-4">
                  <p className="font-medium text-foreground">{item.namaOrg}</p>
                  <p className="text-sm text-muted-foreground">{item.ticketId} · {item.status}</p>
                </div>
              ))
            )}
          </div>
        </div>
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
