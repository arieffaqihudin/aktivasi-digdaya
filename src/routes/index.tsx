import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import {
  LogIn,
  KeyRound,
  ArrowRight,
  BadgeCheck,
  Search,
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F7FBF8]">
      <DecorativeBackground />

      <PublicHeader />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:py-12 lg:py-16">
        <div className="mx-auto w-full max-w-[640px]">
          <Intro />
          <div className="mt-8">
            <GatewayCards />
          </div>
          <div className="mt-5">
            <StatusLink />
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
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0, 132, 61, 0.10) 0%, rgba(0, 132, 61, 0.04) 40%, transparent 75%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-24 -top-24 hidden sm:block h-[420px] w-[420px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(18, 160, 92, 0.18) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 hidden sm:block h-[460px] w-[460px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 132, 61, 0.14) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(#00843D 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 75%)",
        }}
      />
    </>
  );
}

function Intro() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#DDEBE3] bg-[#EAF8F0] px-3 py-1 shadow-sm">
        <BadgeCheck className="h-3.5 w-3.5 text-[#00843D]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#005C2E]">
          Portal Aktivasi Digdaya NU
        </span>
      </div>

      <h1 className="mt-5 text-[26px] font-bold leading-tight tracking-tight text-[#0F2A1A] sm:text-[32px]">
        Silakan pilih sesuai{" "}
        <span className="text-[#00843D]">kondisi kepengurusan</span>{" "}
        Anda.
      </h1>

      <p className="mt-3 max-w-[480px] text-[14px] leading-relaxed text-[#6B7280]">
        Portal ini digunakan untuk aktivasi dan pendaftaran administrator Digdaya.
      </p>
    </div>
  );
}

function GatewayCards() {
  return (
    <div className="rounded-3xl border border-[#DDEBE3] bg-white p-5 shadow-[0_8px_30px_rgba(0,132,61,0.08)] sm:p-7">
      <GatewayOption
        to="/login"
        icon={<LogIn className="h-5 w-5" />}
        badge="Sudah Production"
        badgeTone="muted"
        title="PW/PC Anda sudah production?"
        description="Login untuk mendaftarkan kepengurusan di bawah kewenangan Anda, seperti Lembaga, MWC, Ranting, atau struktur lainnya."
        cta="Login dengan Email / NU.ID"
        ctaMobile="Login Email / NU.ID"
        variant="secondary"
      />

      <div className="my-[22px] flex items-center gap-3 sm:my-5">
        <div className="h-px flex-1 bg-[#E5EFE9]" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A97A8] sm:text-[10px]">
          Atau
        </span>
        <div className="h-px flex-1 bg-[#E5EFE9]" />
      </div>

      <GatewayOption
        to="/kode-akses"
        icon={<KeyRound className="h-5 w-5" />}
        badge="Belum Production"
        badgeTone="primary"
        title="PW/PC Anda belum production?"
        description="Gunakan kode akses dari PBNU untuk mengaktifkan kepengurusan dan mendaftarkan administrator Digdaya."
        cta="Masukkan Kode Akses"
        variant="primary"
      />
    </div>
  );
}

function StatusLink() {
  return (
    <div className="rounded-2xl border border-[#DDEBE3] bg-white/80 p-5 text-center backdrop-blur-sm">
      <h3 className="text-[14px] font-semibold text-[#0F2A1A]">
        Sudah punya nomor tiket?
      </h3>
      <p className="mt-1 text-[13px] text-[#6B7280]">
        Pantau status pengajuan aktivasi Anda di sini.
      </p>
      <Link
        to="/cek-status"
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#EAF8F0] px-4 py-2 text-[13px] font-semibold text-[#00843D] transition-colors hover:bg-[#DDF5E8] hover:text-[#005C2E]"
      >
        <Search className="h-3.5 w-3.5" />
        Cek Status Pengajuan
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function GatewayOption({
  to,
  icon,
  badge,
  badgeTone,
  title,
  description,
  cta,
  ctaMobile,
  variant,
}: {
  to: string;
  icon: React.ReactNode;
  badge: string;
  badgeTone: "primary" | "muted";
  title: string;
  description: string;
  cta: string;
  ctaMobile?: string;
  variant: "primary" | "secondary";
}) {
  const cardClass =
    variant === "primary"
      ? "group block rounded-3xl border border-[#DDEBE3] bg-gradient-to-br from-[#F2FBF6] to-white p-5 transition-all hover:border-[#00843D]/40 hover:shadow-[0_6px_20px_rgba(0,132,61,0.12)] sm:rounded-2xl"
      : "group block rounded-3xl border border-[#E5EFE9] bg-white p-5 transition-all hover:border-[#00843D]/30 hover:bg-[#F7FBF8] hover:shadow-[0_4px_14px_rgba(0,132,61,0.06)] sm:rounded-2xl";

  const iconWrap =
    variant === "primary"
      ? "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00843D] to-[#005C2E] text-white shadow-[0_4px_10px_rgba(0,132,61,0.25)] sm:h-11 sm:w-11"
      : "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF8F0] text-[#00843D] ring-1 ring-[#DDEBE3] transition-colors group-hover:bg-[#DDF5E8] sm:h-11 sm:w-11";

  const ctaClass =
    variant === "primary"
      ? "mt-[18px] flex w-full min-h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#00843D] px-4 text-[15px] font-bold text-white shadow-[0_4px_12px_rgba(0,132,61,0.25)] transition-all group-hover:bg-[#005C2E] group-hover:shadow-[0_6px_16px_rgba(0,132,61,0.32)] sm:mt-3 sm:inline-flex sm:h-10 sm:min-h-0 sm:w-auto sm:text-[13px] sm:font-semibold"
      : "mt-[18px] flex w-full min-h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#DDEBE3] bg-white px-4 text-[15px] font-bold text-[#005C2E] transition-all group-hover:border-[#00843D]/40 group-hover:bg-[#EAF8F0] sm:mt-3 sm:inline-flex sm:h-10 sm:min-h-0 sm:w-auto sm:text-[13px] sm:font-semibold";

  const badgeClass =
    badgeTone === "primary"
      ? "inline-flex w-fit items-center rounded-full bg-[#00843D]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#00843D] sm:px-2 sm:py-0.5 sm:text-[10px]"
      : "inline-flex w-fit items-center rounded-full bg-[#F1F5F2] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] sm:px-2 sm:py-0.5 sm:text-[10px]";

  return (
    <Link to={to} className={cardClass}>
      {/* Mobile: stacked vertical */}
      <div className="flex flex-col sm:hidden">
        <div className={iconWrap}>{icon}</div>
        <span className={`${badgeClass} mt-[14px]`}>{badge}</span>
        <h3 className="mt-[12px] text-[22px] font-bold leading-[1.25] text-[#0F2A1A]">
          {title}
        </h3>
        <p className="mt-[10px] text-[15px] leading-[1.55] text-[#6B7280]">
          {description}
        </p>
        <div className={ctaClass}>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {ctaMobile ?? cta}
          </span>
          <ArrowRight className="h-[18px] w-[18px] shrink-0" />
        </div>
      </div>

      {/* Desktop/tablet: horizontal */}
      <div className="hidden sm:flex items-start gap-4">
        <div className={iconWrap}>{icon}</div>
        <div className="flex-1 min-w-0">
          <span className={badgeClass}>{badge}</span>
          <h3 className="mt-2 text-[15px] font-bold text-[#0F2A1A]">{title}</h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[#6B7280]">
            {description}
          </p>
          <div className={ctaClass}>
            <span className="whitespace-nowrap">{cta}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
