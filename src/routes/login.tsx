import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useState } from "react";
import { actions } from "@/lib/store";
import { toast } from "sonner";
import { Loader2, KeyRound, Inbox, FileCheck2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login Internal — Portal Aktivasi Digdaya" },
      { name: "description", content: "Masuk ke Portal Aktivasi Digdaya." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const user = actions.login(email.trim().toLowerCase(), pwd);
    setLoading(false);
    if (!user) { toast.error("Email atau kata sandi salah."); return; }
    toast.success(`Selamat datang, ${user.name}.`);
    if (user.role === "Super Admin") navigate({ to: "/admin" });
    else if (user.role === "Reviewer") navigate({ to: "/review" });
    else if (user.role === "PW") navigate({ to: "/pw" });
    else navigate({ to: "/pc" });
  };

  const quickFill = (e: string) => { setEmail(e); setPwd("password"); };

  const points = [
    { icon: KeyRound, text: "Kode akses untuk aktivasi PC" },
    { icon: Inbox, text: "Inbox review terpusat" },
    { icon: FileCheck2, text: "Export Peruri dan monitoring SLA" },
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
          <Logo />
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
      <main className="flex min-h-screen flex-col items-center justify-center p-6 lg:p-12">
        {/* Mobile header */}
        <div className="mb-6 flex flex-col items-center gap-2 lg:hidden">
          <Logo />
          <p className="text-sm font-medium text-muted-foreground">Portal Aktivasi Digdaya</p>
        </div>

        <div className="w-full max-w-[420px] rounded-lg border border-border bg-card p-7 shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Masuk ke Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gunakan akun Digdaya/NU.ID untuk melanjutkan.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@digdaya.nu.id" className="mt-1.5" required />
            </div>
            <div>
              <Label htmlFor="pwd" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</Label>
              <Input id="pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="mt-1.5" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Masuk
            </Button>
          </form>
          <div className="mt-4 flex items-center justify-between text-xs">
            <a href="#" className="text-primary hover:underline">Lupa password?</a>
            <a href="#" className="text-muted-foreground hover:text-foreground hover:underline">Butuh bantuan?</a>
          </div>
          <details className="mt-5 text-xs text-muted-foreground">
            <summary className="cursor-pointer select-none">Akun demo (development helper)</summary>
            <div className="mt-2 space-y-1 rounded-md border border-border bg-secondary/30 p-3 font-mono">
              {[
                { e: "admin@digdaya.nu.id",    r: "Super Admin PBNU" },
                { e: "reviewer@digdaya.nu.id", r: "Reviewer Tim Digdaya" },
                { e: "pw@digdaya.nu.id",       r: "PW Aktif (PWNU DIY)" },
                { e: "pc@digdaya.nu.id",       r: "PC Aktif (PCNU Sleman)" },
              ].map((u) => (
                <button type="button" key={u.e} onClick={() => quickFill(u.e)} className="block w-full text-left hover:text-foreground">
                  {u.e} · password — {u.r}
                </button>
              ))}
            </div>
          </details>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">← Kembali ke portal publik</Link>
        </p>
      </main>
    </div>
  );
}
