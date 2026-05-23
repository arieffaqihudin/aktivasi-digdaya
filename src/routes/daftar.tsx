import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";
import { masterKepengurusan } from "@/data/mockData";
import { isValidEmail, isValidNIK, isValidPhone, normalizePhone } from "@/utils/validation";
import { actions } from "@/lib/store";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, FileText, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/daftar")({
  head: () => ({
    meta: [
      { title: "Daftarkan Administrator — Portal Aktivasi Digdaya" },
      { name: "description", content: "Formulir self-service pendaftaran administrator Digdaya untuk kepengurusan NU." },
    ],
  }),
  component: DaftarPage,
});

const STEPS = ["Data Kepengurusan", "Data Administrator", "Dokumen Pendukung", "Konfirmasi"];

interface Form {
  namaKepengurusan: string;
  tingkat: string;
  pw: string;
  namaAdmin: string;
  jabatan: string;
  nik: string;
  hp: string;
  email: string;
  skFile?: File | null;
  suratFile?: File | null;
}

function DaftarPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<Form>({
    namaKepengurusan: "",
    tingkat: "",
    pw: "",
    namaAdmin: "",
    jabatan: "",
    nik: "",
    hp: "",
    email: "",
  });

  const update = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  const errors = useMemo(() => validate(form, step), [form, step]);

  const next = () => {
    if (Object.keys(errors).length > 0) {
      toast.error("Mohon lengkapi data yang masih kosong atau tidak valid.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    const reg = actions.submitRegistration({
      namaKepengurusan: form.namaKepengurusan,
      tingkat: form.tingkat as any,
      pw: form.pw,
      namaAdmin: form.namaAdmin,
      jabatan: form.jabatan,
      nik: form.nik,
      hp: normalizePhone(form.hp),
      email: form.email,
      skFile: form.skFile?.name,
      suratTugasFile: form.suratFile?.name,
    });
    setSubmitting(false);
    toast.success("Pendaftaran berhasil dikirim.");
    navigate({ to: "/status/$ticketId", params: { ticketId: reg.ticketId } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Daftarkan Administrator</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Lengkapi data berikut untuk mengaktifkan administrator Digdaya bagi kepengurusan Anda.
            </p>
          </div>

          <Stepper step={step} />

          <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-7">
            {step === 0 && <StepKepengurusan form={form} update={update} errors={errors} />}
            {step === 1 && <StepAdmin form={form} update={update} errors={errors} />}
            {step === 2 && <StepDokumen form={form} update={update} />}
            {step === 3 && <StepKonfirmasi form={form} />}

            <div className="mt-7 flex items-center justify-between gap-3 border-t border-border pt-5">
              <Button variant="ghost" onClick={prev} disabled={step === 0}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next}>
                  Lanjut <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={submit} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Kirim Pendaftaran
                </Button>
              )}
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Sudah pernah mendaftar?{" "}
            <Link to="/cek-status" className="font-medium text-primary-dark hover:underline">
              Cek status pendaftaran
            </Link>
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-1.5 overflow-x-auto">
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={s} className="flex flex-1 items-center gap-2 whitespace-nowrap">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                done ? "bg-primary text-primary-foreground" : active ? "bg-primary/15 text-primary-dark ring-2 ring-primary/40" : "bg-secondary text-muted-foreground",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={cn("text-xs font-medium", active ? "text-foreground" : "text-muted-foreground")}>
              {s}
            </span>
            {i < STEPS.length - 1 && <div className="hidden h-px flex-1 bg-border sm:block" />}
          </li>
        );
      })}
    </ol>
  );
}

function StepKepengurusan({ form, update, errors }: { form: Form; update: (p: Partial<Form>) => void; errors: Record<string, string> }) {
  const selected = masterKepengurusan.find((m) => m.nama === form.namaKepengurusan);
  return (
    <div className="space-y-5">
      <Section title="Data Kepengurusan" desc="Pilih kepengurusan Anda. Tingkat dan Wilayah PW akan terisi otomatis." />
      <Field label="Nama Kepengurusan" required error={errors.namaKepengurusan}>
        <Select
          value={form.namaKepengurusan}
          onValueChange={(v) => {
            const m = masterKepengurusan.find((x) => x.nama === v);
            update({ namaKepengurusan: v, tingkat: m?.tingkat ?? "", pw: m?.pw ?? "" });
          }}
        >
          <SelectTrigger><SelectValue placeholder="Pilih kepengurusan" /></SelectTrigger>
          <SelectContent>
            {masterKepengurusan.map((m) => (
              <SelectItem key={m.id} value={m.nama}>
                <span className="flex items-center gap-2">
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-primary-dark">{m.tingkat}</span>
                  {m.nama}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tingkat Kepengurusan">
          <Input value={form.tingkat} readOnly placeholder="Otomatis" className="bg-secondary/40" />
        </Field>
        <Field label="Wilayah PW">
          <Input value={form.pw} readOnly placeholder="Otomatis" className="bg-secondary/40" />
        </Field>
      </div>

      {selected && (
        <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-primary-dark">
          Data kepengurusan terverifikasi dalam master data Digdaya.
        </div>
      )}
    </div>
  );
}

function StepAdmin({ form, update, errors }: { form: Form; update: (p: Partial<Form>) => void; errors: Record<string, string> }) {
  const previewHp = form.hp ? normalizePhone(form.hp) : "";
  return (
    <div className="space-y-5">
      <Section title="Data Administrator" desc="Administrator adalah orang yang akan mengelola akun Digdaya untuk kepengurusan ini." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama Administrator" required error={errors.namaAdmin}>
          <Input value={form.namaAdmin} onChange={(e) => update({ namaAdmin: e.target.value })} placeholder="Nama lengkap" />
        </Field>
        <Field label="Jabatan Administrator" required error={errors.jabatan}>
          <Input value={form.jabatan} onChange={(e) => update({ jabatan: e.target.value })} placeholder="Sekretaris, Ketua, Bendahara, Operator…" />
        </Field>
      </div>
      <Field label="NIK" required error={errors.nik} helper="16 digit angka sesuai KTP.">
        <Input value={form.nik} onChange={(e) => update({ nik: e.target.value.replace(/\D/g, "").slice(0, 16) })} placeholder="3404XXXXXXXXXXXX" inputMode="numeric" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nomor HP WhatsApp" required error={errors.hp} helper={previewHp ? `Akan dinormalisasi menjadi ${previewHp}` : "Contoh: 0812xxxx atau +62812xxxx"}>
          <Input value={form.hp} onChange={(e) => update({ hp: e.target.value })} placeholder="08xxxxxxxxxx" />
        </Field>
        <Field label="Email" required error={errors.email}>
          <Input type="email" value={form.email} onChange={(e) => update({ email: e.target.value })} placeholder="administrator@kepengurusan.id" />
        </Field>
      </div>
    </div>
  );
}

function StepDokumen({ form, update }: { form: Form; update: (p: Partial<Form>) => void }) {
  return (
    <div className="space-y-5">
      <Section title="Dokumen Pendukung" desc="Phase 1: upload dokumen bersifat opsional. Tim Digdaya dapat meminta dokumen tambahan saat review." />
      <FileField label="SK Penunjukan" file={form.skFile} onChange={(f) => update({ skFile: f })} />
      <FileField label="Surat Tugas" file={form.suratFile} onChange={(f) => update({ suratFile: f })} />
      <p className="text-xs text-muted-foreground">Format: PDF, JPG, atau PNG. Maksimal 5 MB per file.</p>
    </div>
  );
}

function FileField({ label, file, onChange }: { label: string; file?: File | null; onChange: (f: File | null) => void }) {
  return (
    <Field label={`${label} (opsional)`}>
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-dashed border-border bg-secondary/30 px-4 py-3 text-sm hover:bg-secondary/50">
        <div className="flex items-center gap-3 min-w-0">
          {file ? <FileText className="h-5 w-5 text-primary shrink-0" /> : <Upload className="h-5 w-5 text-muted-foreground shrink-0" />}
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{file ? file.name : `Pilih file ${label}`}</p>
            <p className="text-xs text-muted-foreground">{file ? `${(file.size / 1024).toFixed(0)} KB` : "PDF / JPG / PNG, maks 5 MB"}</p>
          </div>
        </div>
        <span className="rounded-md border border-input bg-background px-2 py-1 text-xs font-medium">{file ? "Ganti" : "Pilih"}</span>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > 5 * 1024 * 1024) {
              toast.error("Ukuran file melebihi 5 MB.");
              return;
            }
            onChange(f);
          }}
        />
      </label>
    </Field>
  );
}

function StepKonfirmasi({ form }: { form: Form }) {
  const items: [string, string][] = [
    ["Nama Kepengurusan", form.namaKepengurusan],
    ["Tingkat", form.tingkat],
    ["Wilayah PW", form.pw],
    ["Nama Administrator", form.namaAdmin],
    ["Jabatan", form.jabatan],
    ["NIK", form.nik],
    ["Nomor HP", normalizePhone(form.hp)],
    ["Email", form.email],
    ["SK Penunjukan", form.skFile?.name ?? "—"],
    ["Surat Tugas", form.suratFile?.name ?? "—"],
  ];
  return (
    <div className="space-y-5">
      <Section title="Konfirmasi Data" desc="Pastikan seluruh data sudah benar sebelum mengirim pendaftaran." />
      <dl className="divide-y divide-border rounded-md border border-border">
        {items.map(([k, v]) => (
          <div key={k} className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-3">
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground sm:col-span-1">{k}</dt>
            <dd className="text-sm text-foreground sm:col-span-2">{v || "—"}</dd>
          </div>
        ))}
      </dl>
      <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-primary-dark">
        Dengan mengirim pendaftaran, Anda menyatakan bahwa data di atas benar dan dapat dipertanggungjawabkan.
      </div>
    </div>
  );
}

function Section({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Field({ label, children, required, error, helper }: { label: string; children: React.ReactNode; required?: boolean; error?: string; helper?: string }) {
  return (
    <div>
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      ) : helper ? (
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}

function validate(form: Form, step: number): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === 0) {
    if (!form.namaKepengurusan) e.namaKepengurusan = "Pilih kepengurusan.";
  }
  if (step === 1) {
    if (!form.namaAdmin.trim()) e.namaAdmin = "Nama administrator wajib diisi.";
    if (!form.jabatan.trim()) e.jabatan = "Jabatan wajib diisi.";
    if (!isValidNIK(form.nik)) e.nik = "NIK harus terdiri dari 16 digit angka.";
    if (!isValidPhone(form.hp)) e.hp = "Nomor HP tidak valid.";
    if (!isValidEmail(form.email)) e.email = "Format email tidak valid.";
  }
  return e;
}
