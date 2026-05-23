import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Logo } from "@/components/Logo";
import {
  LogIn,
  KeyRound,
  ArrowRight,
  RefreshCw,
  Users,
  Eye,
  BadgeCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portal Aktivasi Digdaya" },
      {
        name: "description",
        content:
          "Pilih cara masuk ke Portal Aktivasi Digdaya: login akun Digdaya atau gunakan kode akses dari PBNU.",
      },
      { property: "og:title", content: "Portal Aktivasi Digdaya" },
      {
        property: "og:description",
        content: "Gateway resmi aktivasi kepengurusan NU di Digdaya.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Decorative background elements */}
      <DecorativeBackground />

      <PublicHeader />

      <main className="relative z-10 flex flex-1 items-center px-4 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-[1080px]">
          {/* Mobile: stacked. Desktop: two columns */}
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left column: context */}
            <LeftColumn />

            {/* Right column: choice card */}
            <RightColumn />
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

function DecorativeBackground() {
  return (
    <>
      {/* Soft green blob top-right */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-[380px] w-[380px] rounded-full opacity-[0.04]"
        style={{
          background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
        }}
      />
      {/* Soft green blob bottom-left */}
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 h-[440px] w-[440px] rounded-full opacity-[0.035]"
        style={{
          background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
        }}
      />
      {/* Subtle dot pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: `radial-gradient(var(--color-border) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />
    </>
  );
}

function LeftColumn() {
  return (
    <div className="flex flex-col">
      {/* Badge */}
      <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1">
        <BadgeCheck className="h-3.5 w-3.5 text-primary" />
        <span className="text-[12px] font-semibold tracking-wide text-primary">
          Portal Resmi Digdaya NU
        </span>
      </div>

      {/* Headline */}
      <h1 className="mt-5 text-[28px] font-bold leading-tight tracking-tight text-foreground sm:text-[32px]">
        Portal Aktivasi Digdaya
      </h1>

      {/* Subheadline */}
      <p className="mt-3 max-w-[440px] text-[14px] leading-relaxed text-muted-foreground">
        Pilih cara masuk sesuai status kepengurusan Anda untuk melanjutkan
        proses aktivasi dan onboarding.
      </p>

      {/* 3 benefit points */}
      <ul className="mt-7 space-y-3">
        <BenefitItem icon={<RefreshCw className="h-4 w-4" />}>
          Aktivasi PW/PC belum production
        </BenefitItem>
        <BenefitItem icon={<Users className="h-4 w-4" />}>
          Login untuk PW/PC yang sudah production
        </BenefitItem>
        <BenefitItem icon={<Eye className="h-4 w-4" />}>
          Status pengajuan terpantau oleh Tim Digdaya
        </BenefitItem>
      </ul>

      {/* Info box */}
      <div className="mt-7 max-w-[420px] rounded-lg border border-border/80 bg-secondary/40 p-3.5">
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Sudah punya akun Digdaya? Gunakan{" "}
          <span className="font-medium text-foreground">login</span>. Menerima
          kode akses dari PBNU? Gunakan{" "}
          <span className="font-medium text-foreground">kode akses</span>.
        </p>
      </div>
    </div>
  );
}

function BenefitItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
        {icon}
      </span>
      <span className="text-[13px] text-muted-foreground">{children}</span>
    </li>
  );
}

function RightColumn() {
  return (
    <div className="flex flex-col">
      <div className="rounded-xl border border-border bg-card p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] sm:p-7">
        {/* Card header */}
        <div className="mb-6">
          <h2 className="text-[16px] font-semibold text-foreground">
            Silakan Pilih Akses
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Gunakan jalur yang sesuai dengan kondisi kepengurusan Anda.
          </p>
        </div>

        {/* Option 1: Login */}
        <GatewayOption
          to="/login"
          icon={<LogIn className="h-5 w-5" />}
          title="Login dengan Email / NU.ID"
          description="Untuk PW/PC yang sudah production dan memiliki akun Digdaya."
          cta="Masuk ke Dashboard"
        />

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
            Atau
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Option 2: Kode Akses */}
        <GatewayOption
          to="/kode-akses"
          icon={<KeyRound className="h-5 w-5" />}
          title="Masukkan Kode Akses"
          description="Untuk PW/PC yang belum production dan menerima kode akses dari PBNU."
          cta="Mulai Aktivasi"
        />
      </div>

      {/* Cek status link below card */}
      <div className="mt-5 text-center">
        <Link
          to="/cek-status"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary transition-colors hover:text-primary-dark hover:underline"
        >
          Sudah punya nomor tiket? Cek status pengajuan
        </Link>
      </div>
    </div>
  );
}

function GatewayOption({
  to,
  icon,
  title,
  description,
  cta,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 rounded-lg border border-border bg-background p-4 transition-all hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      {/* Icon */}
      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/[0.08] text-primary transition-colors group-hover:bg-primary/[0.12]">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-[14px] font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="mt-2.5 flex items-center gap-1.5 text-[13px] font-semibold text-primary">
          {cta}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
