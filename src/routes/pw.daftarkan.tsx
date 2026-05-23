import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { actions, useStore } from "@/lib/store";
import { type TipeOrg } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidNIK, isValidEmail, normalizePhone, isValidPhone } from "@/utils/validation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { findPwDemoTarget, pwDemoTargets } from "@/lib/demo-scope-data";

export const Route = createFileRoute("/pw/daftarkan")({
  validateSearch: (search: Record<string, unknown>) => ({
    targetId: typeof search.targetId === "string" ? search.targetId : undefined,
  }),
  component: Daftarkan,
});

function Daftarkan() {
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

  const target = findPwDemoTarget(search.targetId);
  const history = useMemo(
    () => registrations.filter((r) => r.sumberPengajuan === "PW_DASHBOARD").slice(0, 5),
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
      namaAdmin,
      jabatan,
      nik,
      hp: normHp,
      email,
      sumberSuratTugas: tipeSurat,
      suratTugasFile: tipeSurat === "MANUAL_UPLOAD" ? suratValue : undefined,
      dokumenSistem: tipeSurat === "DIGDAYA_PERSURATAN" ? {
        documentId: `DOC-${target.id}`,
        nomorSurat: suratValue,
        namaDokumen: `Surat Tugas ${target.name}`,
        tanggalSurat: new Date().toISOString().slice(0, 10),
        penandatangan: "Ketua PWNU DI Yogyakarta",
        status: "Tertandatangani",
      } : undefined,
    });
    setBusy(false);
    if (!reg) { toast.error("Gagal mengirim."); return; }
    toast.success(`Pengajuan dikirim. Tiket: ${reg.ticketId}`);
    navigate({ to: "/pw/status-pengajuan" });
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
              {pwDemoTargets.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.type}</p>
                  </div>
                  <Link to="/pw/daftarkan" search={{ targetId: item.id }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
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
                <ReadOnlyField label="Organisasi" value={target.name} />
                <ReadOnlyField label="Tipe" value={target.type} />
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
                placeholder={tipeSurat === "DIGDAYA_PERSURATAN" ? "Contoh: 011/PW-DIY/ST/2026" : "Contoh: surat-tugas-pc-yogyakarta.pdf"}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kirim Pengajuan
              </Button>
              <Link to="/pw/status-pengajuan" className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground">
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

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1.5" required />
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1.5 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground">{value}</div>
    </div>
  );
}
