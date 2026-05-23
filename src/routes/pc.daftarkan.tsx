import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { actions, useStore } from "@/lib/store";
import { masterMWC, masterLembaga, type TipeOrg } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { isValidNIK, isValidEmail, normalizePhone, isValidPhone } from "@/utils/validation";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

export const Route = createFileRoute("/pc/daftarkan")({
  component: Daftarkan,
});

function Daftarkan() {
  const user = useStore((s) => s.user);
  const navigate = useNavigate();
  const [tipe, setTipe] = useState<TipeOrg>("MWC");
  const [namaOrg, setNamaOrg] = useState("");
  const [namaAdmin, setNamaAdmin] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [nik, setNik] = useState("");
  const [hp, setHp] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const mwcOptions = masterMWC.filter((m) => m.pcId === user?.pcId);
  const lembagaOptions = masterLembaga.filter((m) => m.pcId === user?.pcId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaOrg.trim()) { toast.error("Nama organisasi wajib."); return; }
    if (!isValidNIK(nik)) { toast.error("NIK harus 16 digit."); return; }
    if (!isValidEmail(email)) { toast.error("Email tidak valid."); return; }
    const normHp = normalizePhone(hp);
    if (!isValidPhone(normHp)) { toast.error("Nomor HP tidak valid."); return; }
    if (!file) { toast.error("Upload surat tugas wajib."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB."); return; }
    setBusy(true); await new Promise((r) => setTimeout(r, 500));
    const reg = actions.submitJalurB({ tipeOrg: tipe, namaOrg, namaAdmin, jabatan, nik, hp: normHp, email, suratTugasFile: file.name });
    setBusy(false);
    if (!reg) { toast.error("Gagal mengirim."); return; }
    toast.success(`Pendaftaran dikirim. Tiket: ${reg.ticketId}`);
    navigate({ to: "/pc/status-pengajuan" });
  };

  return (
    <div>
      <PageHeader title="Daftarkan Organisasi Bawahan" subtitle={`Jalur B · diajukan oleh ${user?.pcName ?? "PC"}`} />
      <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5 p-6">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tipe Organisasi</Label>
            <Select value={tipe} onValueChange={(v) => { setTipe(v as TipeOrg); setNamaOrg(""); }}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MWC">MWC</SelectItem>
                <SelectItem value="Lembaga PC">Lembaga PC</SelectItem>
                <SelectItem value="Ranting">Ranting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nama Organisasi</Label>
            {tipe === "MWC" && (
              <Select value={namaOrg} onValueChange={setNamaOrg}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih MWC…" /></SelectTrigger>
                <SelectContent>
                  {mwcOptions.map((m) => <SelectItem key={m.id} value={m.nama}>{m.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {tipe === "Lembaga PC" && (
              <Select value={namaOrg} onValueChange={setNamaOrg}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih Lembaga…" /></SelectTrigger>
                <SelectContent>
                  {lembagaOptions.map((m) => <SelectItem key={m.id} value={m.nama}>{m.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {tipe === "Ranting" && (
              <Input className="mt-1.5" value={namaOrg} onChange={(e) => setNamaOrg(e.target.value)} placeholder="Contoh: Ranting NU Condongcatur" />
            )}
            {tipe === "Ranting" && <p className="mt-1 text-xs text-muted-foreground">Ranting diisi manual karena belum ada master data terpusat.</p>}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold">Data Administrator</p>
          <Field label="Nama Administrator" value={namaAdmin} onChange={setNamaAdmin} />
          <Field label="Jabatan" value={jabatan} onChange={setJabatan} />
          <Field label="NIK (16 digit)" value={nik} onChange={(v) => setNik(v.replace(/\D/g, "").slice(0,16))} />
          <Field label="Nomor HP WhatsApp" value={hp} onChange={setHp} placeholder="08xxxxxxxxxx" />
          <Field label="Email" value={email} onChange={setEmail} type="email" />
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Scan Surat Tugas (PDF/JPG/PNG, max 5MB)</Label>
            <div className="mt-1.5 flex items-center gap-2 rounded-md border border-dashed border-border bg-secondary/30 p-3">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="border-0 bg-transparent p-0 file:mr-3" />
            </div>
            {file && <p className="mt-1 text-xs text-muted-foreground">{file.name}</p>}
          </div>
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
