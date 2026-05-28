import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useState } from "react";
import { actions, type User } from "@/lib/store";
import { isValidEmail } from "@/utils/validation";
import { toast } from "sonner";
import { Loader2, KeyRound, Inbox, FileCheck2, ShieldCheck, Mail } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login Internal — Portal Aktivasi Digdaya" },
      { name: "description", content: "Masuk ke Portal Aktivasi Digdaya dengan NU.ID atau email OTP." },
    ],
  }),
  component: LoginPage,
});

type Step = "method" | "otp";

function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("method");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingNuId, setLoadingNuId] = useState(false);

  const routeByRole = (user: User) => {
    toast.success(`Selamat datang, ${user.name}.`);
    if (user.role === "Super Admin") navigate({ to: "/ops" });
    else if (user.role === "Reviewer") navigate({ to: "/review" });
    else if (user.role === "PW") navigate({ to: "/pw" });
    else navigate({ to: "/pc" });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) { toast.error("Email wajib diisi."); return; }
    if (!isValidEmail(value)) { toast.error("Format email tidak valid."); return; }
    setLoadingSend(true);
    await new Promise((r) => setTimeout(r, 250));
    setLoadingSend(false);
    setStep("otp");
    toast.success("Kode OTP telah dikirim. (Demo: 123456)");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error("Masukkan 6 digit OTP."); return; }
    setLoadingVerify(true);
    await new Promise((r) => setTimeout(r, 250));
    setLoadingVerify(false);
    if (otp !== "123456") {
      toast.error("Kode OTP tidak sesuai. Silakan coba lagi.");
      return;
    }
    const user = actions.loginAs(email);
    if (user) routeByRole(user);
  };

  const handleNuId = async () => {
    setLoadingNuId(true);
    await new Promise((r) => setTimeout(r, 250));
    setLoadingNuId(false);
    toast.success("Simulasi login NU.ID berhasil.");
    // Default to PC production user for NU.ID demo
    const user = actions.loginAs("pc@digdaya.nu.id");
    if (user) routeByRole(user);
  };

  const quickFill = (e: string) => setEmail(e);

  const points = [
    { icon: KeyRound, text: "Kode akses untuk aktivasi PC" },
    { icon: Inbox, text: "Inbox review terpusat" },
    { icon: FileCheck2, text: "Export Peruri batch aktivasi" },
  ];

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      {/* Left branding column */}
      <aside
        className="relative hidden lg:flex lg:flex-col lg:justify-between bg-primary/5 p-12 border-r border-border overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--primary) / 0.08) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      >
        <div>
          <Logo variant="login" />
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Portal Aktivasi Digdaya
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Sistem aktivasi administrator dan onboarding kepengurusan NU.
          </p>
          <ul className="mt-8 space-y-3">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-foreground">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">© Digdaya · PBNU</p>
      </aside>

      {/* Right form column */}
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-12">
        {/* Mobile header (compact) */}
        <div className="mb-3 flex flex-col items-center gap-1 lg:hidden">
          <Logo variant="mobile" />
          <p className="text-xs font-medium text-muted-foreground">Portal Aktivasi Digdaya</p>
        </div>

        <div className="w-full max-w-[440px] rounded-lg border border-border bg-card p-5 sm:p-7 shadow-sm">
          {step === "method" && (
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-foreground">Masuk ke Portal Aktivasi</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Gunakan NU.ID atau email terdaftar untuk melanjutkan.
              </p>
            </div>
          )}

          {step === "otp" && (
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-foreground">Masukkan Kode OTP</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Kode OTP telah dikirim ke email Anda.
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">{email}</p>
            </div>
          )}

          {step === "method" && (
            <div className="mt-6 space-y-5">
              {/* NU.ID button */}
              <button
                type="button"
                onClick={handleNuId}
                disabled={loadingNuId}
                className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-md border border-primary/40 bg-white text-foreground shadow-sm transition-colors hover:bg-primary/5 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
              >
                {loadingNuId ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-primary" />
                )}
                <span className="text-sm font-semibold">Masuk dengan NU.ID</span>
              </button>

              {/* Separator */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Atau</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Email + OTP */}
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan alamat email"
                    className="mt-1.5 h-12 text-base md:text-sm"
                    required
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    OTP akan dikirim ke alamat email yang terdaftar di Digdaya.
                  </p>
                </div>
                <Button type="submit" className="h-14 w-full text-base font-semibold" disabled={loadingSend}>
                  {loadingSend ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                  Kirim OTP
                </Button>
              </form>

              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer select-none">Akun demo (development helper)</summary>
                <div className="mt-2 space-y-1 rounded-md border border-border bg-secondary/30 p-3 font-mono">
                  {[
                    { e: "admin@digdaya.nu.id",    r: "Super Admin PBNU" },
                    { e: "reviewer@digdaya.nu.id", r: "Reviewer Tim Digdaya" },
                    { e: "pw@digdaya.nu.id",       r: "PW Aktif (PWNU DIY)" },
                    { e: "pc@digdaya.nu.id",       r: "PC Aktif (PCNU Sleman)" },
                  ].map((u) => (
                    <button type="button" key={u.e} onClick={() => quickFill(u.e)} className="block w-full text-left hover:text-foreground">
                      {u.e} — {u.r}
                    </button>
                  ))}
                  <p className="pt-1 text-[11px] font-sans text-muted-foreground/80">OTP demo: 123456</p>
                </div>
              </details>
            </div>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Masukkan Kode OTP</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Kode OTP telah dikirim ke email Anda.
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">{email}</p>
              </div>

              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0,1,2,3,4,5].map((i) => (
                      <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button type="submit" className="h-14 w-full text-base font-semibold" disabled={loadingVerify}>
                {loadingVerify && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verifikasi OTP
              </Button>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => { toast.success("Kode OTP baru telah dikirim."); setOtp(""); }}
                  className="text-primary hover:underline"
                >
                  Kirim ulang OTP
                </button>
                <button
                  type="button"
                  onClick={() => { setStep("method"); setOtp(""); }}
                  className="text-muted-foreground hover:text-foreground hover:underline"
                >
                  Ganti email
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">← Kembali ke portal publik</Link>
        </p>
      </main>
    </div>
  );
}
