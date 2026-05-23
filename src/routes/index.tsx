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

      <main className="relative z-10 flex flex-1 items-center px-4 py-6 sm:py-10 lg:py-14">
        <div className="mx-auto w-full max-w-[1080px]">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <LeftColumn />
            </div>
            <div>
              <RightColumn />
            </div>
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
      {/* Soft mint radial wash at top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0, 132, 61, 0.10) 0%, rgba(0, 132, 61, 0.04) 40%, transparent 75%)",
        }}
      />
      {/* Green blob top-right */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 hidden sm:block h-[420px] w-[420px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(18, 160, 92, 0.18) 0%, transparent 70%)",
        }}
      />
      {/* Green blob bottom-left */}
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 hidden sm:block h-[460px] w-[460px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 132, 61, 0.14) 0%, transparent 70%)",
        }}
      />
      {/* Geometric pattern top-right */}
      <div
        className="pointer-events-none absolute right-0 top-20 hidden h-[280px] w-[280px] opacity-[0.06] sm:block"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #00843D 25%, transparent 25%),
            linear-gradient(-45deg, #00843D 25%, transparent 25%)
          `,
          backgroundSize: "16px 16px",
          maskImage:
            "radial-gradient(ellipse at top right, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at top right, black 0%, transparent 70%)",
        }}
      />
      {/* Subtle dot pattern bottom-left */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 hidden h-[260px] w-[260px] opacity-[0.10] sm:block"
        style={{
          backgroundImage: `radial-gradient(#00843D 1px, transparent 1px)`,
          backgroundSize: "18px 18px",
          maskImage:
            "radial-gradient(ellipse at bottom left, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at bottom left, black 0%, transparent 70%)",
        }}
      />
    </>
  );
}

function LeftColumn() {
  return (
    <div className="flex flex-col">
      <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#DDEBE3] bg-[#EAF8F0] px-3 py-1 shadow-sm">
        <BadgeCheck className="h-3.5 w-3.5 text-[#00843D]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#005C2E]">
          Portal Resmi Digdaya NU
        </span>
      </div>

      <h1 className="mt-5 text-[28px] font-bold leading-tight tracking-tight text-[#0F2A1A] sm:text-[34px]">
        Silakan pilih sesuai{" "}
        <span className="text-[#00843D]">kondisi kepengurusan</span>{" "}
        Anda.
      </h1>

      <p className="mt-3 max-w-[440px] text-[14px] leading-relaxed text-[#6B7280]">
        Pilih jalur di bawah ini sesuai apakah PW/PC Anda sudah production
        atau belum.
      </p>
    </div>
  );
}

function RightColumn() {
  return (
    <div className="flex flex-col gap-5">
      {/* Hero Illustration */}
      <div className="mx-auto w-full max-w-[520px] rounded-3xl border border-[#DDEBE3] bg-white p-4 shadow-[0_8px_30px_rgba(0,132,61,0.08)] sm:p-6">
        <img
          src="https://digdaya.nu.id/kader/images/illustration-digdaya-kader-large2.png"
          alt="Ilustrasi Kader Digdaya NU"
          className="mx-auto h-auto w-full max-w-[500px] object-contain max-h-[260px] sm:max-h-[340px] md:max-h-[380px] lg:max-h-[420px]"
        />
      </div>

      <div className="rounded-3xl border border-[#DDEBE3] bg-white p-5 shadow-[0_8px_30px_rgba(0,132,61,0.08)] sm:p-7">
        {/* Option 1: Login */}
        <GatewayOption
          to="/login"
          icon={<LogIn className="h-5 w-5" />}
          badge="Sudah Production"
          badgeTone="muted"
          title="PW/PC Anda sudah production?"
          description="Login untuk mendaftarkan kepengurusan di bawah kewenangan Anda, seperti Lembaga, MWC, Ranting, atau struktur lainnya."
          cta="Login dengan Email / NU.ID"
          variant="secondary"
        />

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E5EFE9]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A97A8]">
            Atau
          </span>
          <div className="h-px flex-1 bg-[#E5EFE9]" />
        </div>

        {/* Option 2: Kode Akses - primary path */}
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
  variant,
}: {
  to: string;
  icon: React.ReactNode;
  badge: string;
  badgeTone: "primary" | "muted";
  title: string;
  description: string;
  cta: string;
  variant: "primary" | "secondary";
}) {
  const cardClass =
    variant === "primary"
      ? "group block rounded-2xl border border-[#DDEBE3] bg-gradient-to-br from-[#F2FBF6] to-white p-5 transition-all hover:border-[#00843D]/40 hover:shadow-[0_6px_20px_rgba(0,132,61,0.12)]"
      : "group block rounded-2xl border border-[#E5EFE9] bg-white p-5 transition-all hover:border-[#00843D]/30 hover:bg-[#F7FBF8] hover:shadow-[0_4px_14px_rgba(0,132,61,0.06)]";

  const iconWrap =
    variant === "primary"
      ? "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00843D] to-[#005C2E] text-white shadow-[0_4px_10px_rgba(0,132,61,0.25)]"
      : "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF8F0] text-[#00843D] ring-1 ring-[#DDEBE3] transition-colors group-hover:bg-[#DDF5E8]";

  const ctaClass =
    variant === "primary"
      ? "mt-3 inline-flex h-10 items-center gap-1.5 rounded-full bg-[#00843D] px-4 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(0,132,61,0.25)] transition-all group-hover:bg-[#005C2E] group-hover:shadow-[0_6px_16px_rgba(0,132,61,0.32)]"
      : "mt-3 inline-flex h-10 items-center gap-1.5 rounded-full border border-[#DDEBE3] bg-white px-4 text-[13px] font-semibold text-[#005C2E] transition-all group-hover:border-[#00843D]/40 group-hover:bg-[#EAF8F0]";

  const badgeClass =
    badgeTone === "primary"
      ? "inline-flex items-center rounded-full bg-[#00843D]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#00843D]"
      : "inline-flex items-center rounded-full bg-[#F1F5F2] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]";

  return (
    <Link to={to} className={cardClass}>
      <div className="flex items-start gap-4">
        <div className={iconWrap}>{icon}</div>
        <div className="flex-1 min-w-0">
          <span className={badgeClass}>{badge}</span>
          <h3 className="mt-2 text-[15px] font-bold text-[#0F2A1A]">{title}</h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[#6B7280]">
            {description}
          </p>
          <div className={ctaClass}>
            {cta}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
