import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  Database,
  Timer,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portal Aktivasi Digdaya — Self-Service Onboarding NU" },
      { name: "description", content: "Sistem self-service untuk aktivasi administrator Digdaya bagi kepengurusan NU." },
      { property: "og:title", content: "Portal Aktivasi Digdaya" },
      { property: "og:description", content: "Sistem self-service aktivasi administrator Digdaya untuk PC, MWC, Ranting, dan Lembaga PC NU." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <Hero />
        <Problem />
        <Benefits />
        <Flow />
        <CTA />
      </main>
      <PublicFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/50 to-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary-dark">
            <Sparkles className="h-3 w-3" /> Self-Service Onboarding Digdaya
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Portal Aktivasi <span className="text-primary">Digdaya</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Sistem self-service untuk aktivasi administrator Digdaya bagi kepengurusan NU
            di seluruh Indonesia — mulai dari PC, MWC, Ranting, hingga Lembaga PC.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/daftar">
              <Button size="lg" className="w-full sm:w-auto">
                Daftarkan Administrator <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/cek-status">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Cek Status Pendaftaran
              </Button>
            </Link>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4 text-left">
            <Stat label="Pengurus Cabang" value="±100" />
            <Stat label="MWC" value="±7.000" />
            <Stat label="Ranting" value="±61.000" />
          </dl>
        </div>
        <HeroIllustration />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-bold text-primary-dark">{value}</dd>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="relative">
      <div className="grid grid-cols-12 items-center gap-3">
        <div className="col-span-5 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <FileCheck className="h-3.5 w-3.5 text-primary" /> Form Publik
          </div>
          <div className="space-y-2">
            <FakeField label="Nama Kepengurusan" value="PCNU Kota Yogyakarta" />
            <FakeField label="Administrator" value="Ahmad Fauzi" />
            <FakeField label="NIK" value="3471 0101 0190 0001" />
            <div className="rounded-md bg-primary px-3 py-2 text-center text-xs font-medium text-primary-foreground">
              Kirim Pendaftaran
            </div>
          </div>
        </div>
        <div className="col-span-2 flex flex-col items-center gap-2">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary-dark">
            Tiket
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>
        <div className="col-span-5 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Dashboard Review</span>
            <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-medium text-success">12 baru</span>
          </div>
          <div className="space-y-1.5">
            {[
              { t: "AKT-2026-000101", s: "Pending" },
              { t: "AKT-2026-000102", s: "Pending" },
              { t: "AKT-2026-000103", s: "Approved" },
            ].map((r) => (
              <div key={r.t} className="flex items-center justify-between rounded-md bg-secondary/60 px-2 py-1.5 text-[11px]">
                <span className="font-mono text-foreground">{r.t}</span>
                <span className={r.s === "Approved" ? "text-success" : "text-warning-foreground"}>{r.s}</span>
              </div>
            ))}
            <div className="mt-2 flex gap-1.5">
              <div className="flex-1 rounded bg-success/15 py-1 text-center text-[10px] font-medium text-success">Approve</div>
              <div className="flex-1 rounded bg-destructive/10 py-1 text-center text-[10px] font-medium text-destructive">Reject</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 text-center text-xs font-medium text-primary-dark">
        Alur Aktivasi: pendaftaran → review Tim Digdaya → batch export Peruri
      </div>
    </div>
  );
}

function FakeField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xs font-medium text-foreground">{value}</p>
    </div>
  );
}

function Problem() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Onboarding manual tidak lagi skalabel
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tim Digdaya PBNU saat ini menanggung beban input data administrator untuk
            seluruh kepengurusan NU di Indonesia. Volume target onboarding sangat besar
            dan tidak realistis dilakukan manual.
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          <ProblemCard count="±100" label="PC" />
          <ProblemCard count="±7.000" label="MWC" />
          <ProblemCard count="±61.000" label="Ranting" />
        </div>
      </div>
    </section>
  );
}

function ProblemCard({ count, label }: { count: string; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 text-center">
      <p className="text-3xl font-bold text-primary">{count}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">organisasi target onboarding</p>
    </div>
  );
}

function Benefits() {
  const items = [
    { icon: Users, title: "Self-Service Registration", desc: "Pengurus mendaftarkan administrator secara mandiri tanpa antrean manual." },
    { icon: ShieldCheck, title: "Review Terpusat", desc: "Tim Digdaya cukup melakukan review dan approval di satu dashboard terpadu." },
    { icon: Database, title: "Export Peruri Otomatis", desc: "Data approved otomatis masuk batch harian siap untuk provisioning Peruri." },
    { icon: Mail, title: "Notifikasi Status", desc: "Pengurus dapat menerima notifikasi email (Phase 1) dan WhatsApp (Phase 2)." },
    { icon: Timer, title: "SLA Jelas", desc: "Maksimal 3 hari kerja per pendaftaran dengan monitoring SLA real-time." },
    { icon: Workflow, title: "Audit Trail Lengkap", desc: "Seluruh aksi tercatat untuk akuntabilitas governance." },
  ];
  return (
    <section className="border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Manfaat Portal Aktivasi</h2>
          <p className="mt-3 text-muted-foreground">
            Memindahkan beban input data dari Tim Digdaya ke kepengurusan, dengan kontrol
            dan tata kelola yang tetap terjaga.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) => (
            <div key={b.title} className="rounded-lg border border-border bg-card p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <b.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{b.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Flow() {
  const steps = [
    { n: 1, t: "Isi Form Pendaftaran", d: "Pengurus melengkapi data kepengurusan dan administrator." },
    { n: 2, t: "Dapat Nomor Tiket", d: "Tiket digunakan untuk memantau status pendaftaran." },
    { n: 3, t: "Review Tim Digdaya", d: "Tim memverifikasi kelengkapan dokumen dan keabsahan." },
    { n: 4, t: "Akun Diaktivasi", d: "Administrator disetujui dan tercatat dalam sistem Digdaya." },
    { n: 5, t: "Masuk Batch Peruri", d: "Data approved otomatis masuk batch export harian." },
  ];
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Alur Aktivasi Singkat</h2>
          <p className="mt-3 text-muted-foreground">
            Lima langkah dari pendaftaran hingga aktivasi akun administrator.
          </p>
        </div>
        <ol className="mt-10 grid gap-3 md:grid-cols-5">
          {steps.map((s) => (
            <li key={s.n} className="relative rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                {s.n}
              </div>
              <p className="text-sm font-semibold text-foreground">{s.t}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-primary-dark text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Siap mendaftarkan administrator?</h2>
          <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">
            Proses pendaftaran hanya beberapa menit. Tim Digdaya akan memproses dalam maksimal 3 hari kerja.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to="/daftar">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              <CheckCircle2 className="mr-1 h-4 w-4" /> Mulai Pendaftaran
            </Button>
          </Link>
          <Link to="/cek-status">
            <Button size="lg" variant="outline" className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto">
              Cek Status Tiket
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
