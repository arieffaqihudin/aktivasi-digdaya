import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import {
  HelpCircle,
  ClipboardList,
  MapPin,
  Phone,
  Mail,
  Instagram,
  ExternalLink,
  Home,
  LogIn,
  KeyRound,
  Search,
  ArrowUpRight,
} from "lucide-react";

export function PublicHeader() {
  return (
    <header className="relative z-10 border-b border-border/60 bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1080px] items-center justify-between px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <Logo variant="header" />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/cek-status"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cek Status</span>
          </Link>
          <a
            href="mailto:digital@nu.or.id"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Bantuan</span>
          </a>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="relative z-10 overflow-hidden bg-gradient-to-br from-[#0B3D28] via-[#0A3522] to-[#072A1A]">
      {/* Decorative corner ornaments */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-[280px] w-[280px] rounded-full opacity-[0.06] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(125,232,176,0.9) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-[260px] w-[260px] rounded-full opacity-[0.05] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(125,232,176,0.9) 0%, transparent 70%)",
        }}
      />
      {/* Subtle dot pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto max-w-[1080px] px-4 sm:px-6">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 gap-5 pt-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 sm:pt-10 lg:grid-cols-[1.15fr_1fr_1fr_1.1fr] lg:gap-8 lg:pt-11">
          {/* Col 1 — Branding */}
          <div className="flex flex-col">
            <div className="inline-flex w-fit items-center gap-2.5">
              <div className="inline-flex items-center justify-center rounded-xl bg-white/95 p-1.5 shadow-sm">
                <Logo variant="footer" />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold leading-tight tracking-wide text-white">
                  DIGDAYA
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">
                  Digitalisasi Data Layanan
                </span>
              </div>
            </div>
            <p className="mt-3 max-w-[260px] text-[12.5px] leading-relaxed text-white/60">
              Portal Aktivasi Digdaya NU digunakan untuk mendukung proses aktivasi PW/PC dan pendaftaran administrator secara tertib, terpantau, dan terintegrasi.
            </p>
          </div>

          {/* Col 2 — Navigasi */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-white/90">
              Navigasi
            </h4>
            <ul className="mt-3.5 flex flex-col gap-2">
              <FooterLink to="/" icon={<Home className="h-3.5 w-3.5" />}>
                Beranda
              </FooterLink>
              <FooterLink to="/login" icon={<LogIn className="h-3.5 w-3.5" />}>
                Login
              </FooterLink>
              <FooterLink to="/kode-akses" icon={<KeyRound className="h-3.5 w-3.5" />}>
                Kode Akses
              </FooterLink>
              <FooterLink to="/cek-status" icon={<Search className="h-3.5 w-3.5" />}>
                Cek Status
              </FooterLink>
              <FooterLink
                to="mailto:digital@nu.or.id"
                icon={<HelpCircle className="h-3.5 w-3.5" />}
                external
              >
                Pusat Bantuan
              </FooterLink>
            </ul>
          </div>

          {/* Col 3 — Ekosistem */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-white/90">
              Ekosistem
            </h4>
            <ul className="mt-3.5 flex flex-col gap-2">
              <EcosystemItem>Digdaya Persuratan</EcosystemItem>
              <EcosystemItem>Digdaya Kepengurusan</EcosystemItem>
              <EcosystemItem>Digdaya AI NU</EcosystemItem>
              <EcosystemItem>NU.ID</EcosystemItem>
            </ul>
          </div>

          {/* Col 4 — Kontak */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-white/90">
              Gedung PBNU
            </h4>
            <ul className="mt-3.5 flex flex-col gap-2.5">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
                <span className="text-[12.5px] leading-relaxed text-white/60">
                  Jl. Kramat Raya No.164, Kec. Senen,
                  <br />
                  DKI Jakarta 10110
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-white/40" />
                <a
                  href="tel:02131923033"
                  className="text-[12.5px] text-white/60 transition-colors hover:text-[#7EE8B0]"
                >
                  (021) 31923033
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-white/40" />
                <a
                  href="mailto:digital@nu.or.id"
                  className="text-[12.5px] text-white/60 transition-colors hover:text-[#7EE8B0]"
                >
                  digital@nu.or.id
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-3.5 w-3.5 shrink-0 text-white/40" />
                <a
                  href="https://instagram.com/digdayanu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-[12.5px] text-white/60 transition-colors hover:text-[#7EE8B0]"
                >
                  @digdayanu
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="mt-6 border-t border-white/[0.08] pt-4 pb-[18px] sm:mt-7 sm:pb-5 lg:mt-8 lg:pb-5">
          <p className="text-center text-[11.5px] text-white/40 sm:text-[12px]">
            &copy; Pengurus Besar Nahdlatul Ulama 2026. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  to,
  icon,
  children,
  external,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  external?: boolean;
}) {
  const className =
    "group inline-flex items-center gap-2 text-[13px] text-white/60 transition-colors hover:text-[#7EE8B0]";

  if (external) {
    return (
      <li>
        <a href={to} className={className}>
          <span className="text-white/30 transition-colors group-hover:text-[#7EE8B0]">
            {icon}
          </span>
          <span>{children}</span>
          <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </a>
      </li>
    );
  }

  return (
    <li>
      <Link to={to} className={className}>
        <span className="text-white/30 transition-colors group-hover:text-[#7EE8B0]">
          {icon}
        </span>
        <span>{children}</span>
      </Link>
    </li>
  );
}

function EcosystemItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-2 text-[13px] text-white/50">
      <span className="inline-block h-1 w-1 rounded-full bg-white/30" />
      <span>{children}</span>
    </li>
  );
}
