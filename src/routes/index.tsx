import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  KeyRound,
  Network,
  ShieldCheck,
  Workflow,
  CheckCircle2,
  Inbox,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portal Aktivasi Digdaya — Aktivasi Administrator NU" },
      { name: "description", content: "Portal aktivasi administrator Digdaya untuk kepengurusan NU melalui kode akses resmi PBNU." },
      { property: "og:title", content: "Portal Aktivasi Digdaya" },
      { property: "og:description", content: "Dua Jalur, Satu Dashboard — sistem otomatisasi onboarding kepengurusan NU." },
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
        <DuaJalur />
        <FlowDiagram />
        <HowItWorks />
        <CTA />
      </main>
      <PublicFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/50 to-background">
      <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 md:py-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary-dark">
          <KeyRound className="h-3 w-3" /> Dua Jalur · Satu Dashboard
        </span>
        <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Portal Aktivasi <span className="text-primary">Digdaya</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Portal aktivasi administrator Digdaya untuk kepengurusan NU melalui kode akses resmi.
          PC mengaktifkan dirinya sendiri, lalu mendaftarkan MWC, Lembaga, dan Ranting di wilayahnya.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/aktivasi">
            <Button size="lg" className="w-full sm:w-auto">
              Mulai Aktivasi <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/cek-status">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Cek Status Pendaftaran
            </Button>
          </Link>
        </div>

        <ul className="mx-auto mt-10 grid max-w-3xl gap-2 text-left text-sm text-muted-foreground sm:grid-cols-2">
          {[
            "Kode akses diberikan oleh PBNU dan hanya berlaku untuk PC yang ditentukan.",
            "Nama PC otomatis muncul setelah kode akses diverifikasi.",
            "Setelah submit, pendaftar mendapat nomor tiket untuk pelacakan.",
            "Status pendaftaran dapat dicek kapan saja menggunakan nomor tiket.",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 rounded-md border border-border bg-card/60 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DuaJalur() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Dua Jalur Aktivasi</h2>
          <p className="mt-3 text-muted-foreground">
            Satu portal melayani dua jalur pendaftaran, masuk ke satu inbox review Tim Digdaya PBNU.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <span className="inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">JALUR A</span>
            <h3 className="mt-3 text-lg font-bold text-foreground">PC — Aktivasi Mandiri</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Untuk PC yang belum aktif. Pendaftaran melalui portal publik menggunakan
              kode akses one-time yang diberikan PBNU.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {["Portal publik · tanpa login", "Verifikasi kode akses resmi", "Nama PC terkunci sesuai kode"].map((t) => (
                <li key={t} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /><span>{t}</span></li>
              ))}
            </ul>
            <Link to="/aktivasi" className="mt-5 inline-flex">
              <Button variant="outline" size="sm">Masuk Portal Aktivasi <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <span className="inline-flex items-center rounded-md border border-info/40 bg-info/10 px-2 py-0.5 text-[11px] font-semibold text-info">JALUR B</span>
            <h3 className="mt-3 text-lg font-bold text-foreground">MWC · Lembaga PC · Ranting</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Untuk organisasi bawahan. Didaftarkan oleh PC yang sudah aktif melalui
              dashboard internal Digdaya PC.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {["Dashboard internal PC", "Hierarki wilayah dijaga", "Beban onboarding terdistribusi"].map((t) => (
                <li key={t} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /><span>{t}</span></li>
              ))}
            </ul>
            <Link to="/login" className="mt-5 inline-flex">
              <Button variant="outline" size="sm">Login PC Aktif <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowDiagram() {
  const steps = [
    { icon: ShieldCheck, label: "PBNU" },
    { icon: KeyRound,    label: "Kode Akses" },
    { icon: CheckCircle2,label: "PC Aktif" },
    { icon: Network,     label: "PC Daftarkan MWC / Lembaga / Ranting" },
    { icon: Inbox,       label: "Inbox Review Tim Digdaya" },
  ];
  return (
    <section className="border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Alur Singkat</h2>
          <p className="mt-3 text-muted-foreground">Dari distribusi kode akses oleh PBNU hingga inbox review terpusat.</p>
        </div>
        <ol className="mt-10 flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between">
          {steps.map((s, i) => (
            <li key={s.label} className="flex flex-1 items-center gap-3">
              <div className="flex flex-1 flex-col items-center rounded-lg border border-border bg-card p-4 text-center">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <s.icon className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold text-foreground">{s.label}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden h-5 w-5 shrink-0 text-muted-foreground md:block" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function HowItWorks() {
  const items = [
    { icon: KeyRound, t: "Verifikasi Kode Akses", d: "Masukkan kode dari PBNU. Sistem memvalidasi keabsahan dan menampilkan nama PC." },
    { icon: ShieldCheck, t: "Isi Data Administrator", d: "Lengkapi data administrator PC dan unggah scan Surat Tugas." },
    { icon: Inbox, t: "Review Tim Digdaya", d: "Tim Digdaya PBNU melakukan review. Maksimal 3 hari kerja." },
    { icon: Workflow, t: "Aktivasi & Provisioning", d: "Setelah disetujui, akun administrator masuk batch Peruri untuk aktivasi." },
  ];
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Cara Kerja</h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((b) => (
            <div key={b.t} className="rounded-lg border border-border bg-card p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <b.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{b.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-primary-dark text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sudah menerima kode akses dari PBNU?</h2>
          <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">
            Mulai aktivasi sekarang. Proses hanya beberapa menit dan tiket pelacakan langsung terbit.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to="/aktivasi">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              <KeyRound className="mr-1 h-4 w-4" /> Mulai Aktivasi
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
