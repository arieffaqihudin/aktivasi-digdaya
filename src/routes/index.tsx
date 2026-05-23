import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Logo } from "@/components/Logo";
import { LogIn, KeyRound, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portal Aktivasi Digdaya" },
      { name: "description", content: "Pilih cara masuk ke Portal Aktivasi Digdaya: login akun Digdaya atau gunakan kode akses dari PBNU." },
      { property: "og:title", content: "Portal Aktivasi Digdaya" },
      { property: "og:description", content: "Gateway resmi aktivasi kepengurusan NU di Digdaya." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 px-4 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[880px]">
          <div className="flex flex-col items-center text-center">
            <Logo variant="header" />
            <h1 className="mt-5 text-[24px] font-bold tracking-tight text-foreground sm:text-[28px]">
              Portal Aktivasi Digdaya
            </h1>
            <p className="mt-2 max-w-[520px] text-[13px] text-muted-foreground sm:text-[14px]">
              Silakan pilih cara masuk sesuai status kepengurusan Anda.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <GatewayCard
              to="/login"
              icon={<LogIn className="h-5 w-5" />}
              title="Sudah Punya Akun Digdaya?"
              description="Masuk menggunakan email atau NU.ID untuk mendaftarkan organisasi di bawah kewenangan Anda."
              cta="Login dengan Email / NU.ID"
              helper="Untuk PW/PC yang sudah production."
              primary
            />
            <GatewayCard
              to="/kode-akses"
              icon={<KeyRound className="h-5 w-5" />}
              title="Punya Kode Akses?"
              description="Gunakan kode akses dari PBNU untuk aktivasi awal PW/PC yang belum production."
              cta="Masukkan Kode Akses"
              helper="Untuk PW/PC yang belum memiliki akses Digdaya."
            />
          </div>

          <div className="mt-8 rounded-md border border-border bg-secondary/40 p-4 text-center text-[12px] text-muted-foreground">
            Belum yakin harus pilih yang mana? Jika sudah punya akun Digdaya, gunakan{" "}
            <span className="font-medium text-foreground">Login</span>. Jika belum punya akun dan
            menerima kode dari PBNU, gunakan{" "}
            <span className="font-medium text-foreground">Kode Akses</span>.
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/cek-status"
              className="text-[12px] font-medium text-primary hover:underline"
            >
              Cek status pengajuan
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function GatewayCard({
  to,
  icon,
  title,
  description,
  cta,
  helper,
  primary,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  helper: string;
  primary?: boolean;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-lg border border-border bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-primary/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
    >
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-md ${
          primary ? "bg-primary text-primary-foreground" : "bg-accent text-primary-dark"
        }`}
      >
        {icon}
      </div>
      <h2 className="mt-4 text-[16px] font-semibold text-foreground">{title}</h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-5 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${
            primary ? "text-primary" : "text-foreground"
          } group-hover:text-primary`}
        >
          {cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
      <p className="mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground">{helper}</p>
    </Link>
  );
}
