import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useState } from "react";
import { actions } from "@/lib/store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
    else navigate({ to: "/pc" });
  };

  const quickFill = (e: string) => { setEmail(e); setPwd("password"); };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-dark p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-xl bg-white/95 px-5 py-3 shadow-lg">
            <Logo />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-7 shadow-xl">
          <h1 className="text-xl font-bold text-foreground">Masuk ke Portal Aktivasi Digdaya</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Khusus Tim Digdaya PBNU, Reviewer, dan PC yang sudah aktif.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@digdaya.nu.id" className="mt-1.5" required />
            </div>
            <div>
              <Label htmlFor="pwd" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Kata Sandi</Label>
              <Input id="pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="mt-1.5" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Masuk
            </Button>
          </form>
          <details className="mt-5 text-xs text-muted-foreground">
            <summary className="cursor-pointer select-none">Akun demo (development helper)</summary>
            <div className="mt-2 space-y-1 rounded-md border border-border bg-secondary/30 p-3 font-mono">
              {[
                { e: "admin@digdaya.nu.id",    r: "Super Admin PBNU" },
                { e: "reviewer@digdaya.nu.id", r: "Reviewer Tim Digdaya" },
                { e: "pc@digdaya.nu.id",       r: "PC Aktif (PCNU Sleman)" },
              ].map((u) => (
                <button type="button" key={u.e} onClick={() => quickFill(u.e)} className="block w-full text-left hover:text-foreground">
                  {u.e} · password — {u.r}
                </button>
              ))}
            </div>
          </details>
        </div>
        <p className="mt-4 text-center text-xs text-white/80">
          <Link to="/" className="hover:underline">← Kembali ke portal publik</Link>
        </p>
      </div>
    </div>
  );
}
