import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { actions, useStore } from "@/lib/store";
import { masterPC, masterLembaga, masterMWC, type TipeOrg } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { isValidNIK, isValidEmail, normalizePhone, isValidPhone } from "@/utils/validation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SuratTugasPicker, validateSuratTugas, type SuratTugasValue } from "@/components/internal/SuratTugasPicker";

export const Route = createFileRoute("/pw/daftarkan")({
  component: Daftarkan,
});

function Daftarkan() {
  const user = useStore((s) => s.user);
  const navigate = useNavigate();
  const [tipe, setTipe] = useState<TipeOrg>("PC");
  const [namaOrg, setNamaOrg] = useState("");
  const [namaAdmin, setNamaAdmin] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [nik, setNik] = useState("");
  const [hp, setHp] = useState("");
  const [email, setEmail] = useState("");
  const [surat, setSurat] = useState<SuratTugasValue>({ sumber: "DIGDAYA_PERSURATAN", dokumen: null, file: null });
  const [busy, setBusy] = useState(false);

  const pcOptions = masterPC.filter((p) => p.pwId === user?.pwId);
  const pcInWilayah = pcOptions.map((p) => p.id);
  const mwcOptions = masterMWC.filter((m) => pcInWilayah.includes(m.pcId));
  const lembagaOptions = masterLembaga.filter((l) => l.pwId === user?.pwId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaOrg.trim()) { toast.error("Nama organisasi wajib."); return; }
    if (!isValidNIK(nik)) { toast.error("NIK harus 16 digit."); return; }
    if (!isValidEmail(email)) { toast.error("Email tidak valid."); return; }
    const normHp = normalizePhone(hp);
    if (!isValidPhone(normHp)) { toast.error("Nomor HP tidak valid."); return; }
    const sErr = validateSuratTugas(surat);
    if (sErr) { toast.error(sErr); return; }

    setBusy(true); await new Promise((r) => setTimeout(r, 500));
    const reg = actions.submitInternal({
      tipeOrg: tipe, namaOrg, namaAdmin, jabatan, nik, hp: normHp, email,
      sumberSuratTugas: surat.sumber,
      suratTugasFile: surat.file?.name,
      dokumenSistem: surat.dokumen ?? undefined,
    });
    setBusy(false);
    if (!reg) { toast.error("Gagal mengirim."); return; }
    toast.success(`Pendaftaran dikirim. Tiket: ${reg.ticketId}`);
    navigate({ to: "/pw/status-pengajuan" });
  };

  return (
    <div>
      <PageHeader title="Daftarkan Organisasi Bawahan" subtitle={`Diajukan oleh ${user?.pwName ?? "PW"}`} />
      <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5 p-6">
        <p className="rounded-md border border-border bg-secondary/40 p-3 text-[12px] text-muted-foreground">
          Gunakan menu ini untuk mendaftarkan organisasi di bawah kewenangan Anda. Surat tugas dapat diambil dari Digdaya Persuratan atau diunggah secara manual.
        </p>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tipe Organisasi</Label>
            <Select value={tipe} onValueChange={(v) => { setTipe(v as TipeOrg); setNamaOrg(""); }}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PC">PC</SelectItem>
                <SelectItem value="MWC">MWC</SelectItem>
                <SelectItem value="Lembaga PW">Lembaga PW</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nama Organisasi</Label>
            {tipe === "PC" && (
              <Select value={namaOrg} onValueChange={setNamaOrg}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih PC…" /></SelectTrigger>
                <SelectContent>
                  {pcOptions.map((m) => <SelectItem key={m.id} value={m.nama}>{m.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {tipe === "MWC" && (
              <Select value={namaOrg} onValueChange={setNamaOrg}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih MWC…" /></SelectTrigger>
                <SelectContent>
                  {mwcOptions.map((m) => <SelectItem key={m.id} value={m.nama}>{m.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {tipe === "Lembaga PW" && (
              <Select value={namaOrg} onValueChange={setNamaOrg}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih Lembaga…" /></SelectTrigger>
                <SelectContent>
                  {lembagaOptions.map((m) => <SelectItem key={m.id} value={m.nama}>{m.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold">Data Administrator</p>
          <Field label="Nama Administrator" value={namaAdmin} onChange={setNamaAdmin} />
          <Field label="Jabatan" value={jabatan} onChange={setJabatan} />
          <Field label="NIK (16 digit)" value={nik} onChange={(v) => setNik(v.replace(/\D/g, "").slice(0,16))} />
          <Field label="Nomor HP WhatsApp" value={hp} onChange={setHp} placeholder="08xxxxxxxxxx" />
          <Field label="Email" value={email} onChange={setEmail} type="email" />
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-semibold">Surat Tugas</p>
          <SuratTugasPicker value={surat} onChange={setSurat} />
        </div>

        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Kirim Pendaftaran
        </Button>
      </form>
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
