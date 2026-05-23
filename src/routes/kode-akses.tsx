import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { actions, type VerifyResult } from "@/lib/store";
import { KeyRound, Loader2, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import type { AccessCode } from "@/data/mockData";

export const Route = createFileRoute("/kode-akses")({
  head: () => ({
    meta: [
      { title: "Masukkan Kode Akses — Portal Aktivasi Digdaya" },
      { name: "description", content: "Verifikasi kode akses dari PBNU untuk memulai aktivasi kepengurusan." },
    ],
  }),
  component: KodeAksesPage,
});

function KodeAksesPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState<AccessCode | null>(null);

  const verify = async () => {
    if (!code.trim()) return;
    setVerifying(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 400));
    const res: VerifyResult = actions.verifyAccessCode(code);
    setVerifying(false);
    if (!res.ok) {
      const msg = {
        notfound: "Kode akses tidak ditemukan atau tidak valid. Silakan hubungi Tim Digdaya PBNU.",
        expired: "Kode akses sudah kedaluwarsa. Silakan minta kode akses baru.",
        used: "Kode akses ini sudah digunakan. Silakan cek status pendaftaran atau hubungi Tim Digdaya.",
        disabled: "Kode akses ini telah dinonaktifkan.",
      }[res.reason];
      setError(msg);
      return;
    }
    setVerified(res.code);
  };

  const lanjut = () => {
    if (!verified) return;
    navigate({ to: "/aktivasi/$accessCode", params: { accessCode: verified.code } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 px-4 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-[560px]">
          <Link to="/" className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke portal
          </Link>
          <div className="mt-4 text-center">
            <h1 className="text-[22px] font-bold tracking-tight text-foreground sm:text-[24px]">
              Masukkan Kode Akses
            </h1>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Gunakan kode akses dari PBNU untuk memulai aktivasi kepengurusan.
            </p>
          </div>

          <div className="mt-7 rounded-xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-7">
            <div className="space-y-4">
              <div>
                <Label htmlFor="code" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Kode Akses
                </Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setError(null); setVerified(null); }}
                  placeholder="DGD-XXXX-XXXX"
                  className="mt-1.5 h-11 font-mono uppercase tracking-wider"
                  autoFocus
                  disabled={!!verified}
                />
                {error && (
                  <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-[13px] text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {!verified && (
                <Button onClick={verify} disabled={verifying || !code.trim()} className="h-11 w-full">
                  {verifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                  Verifikasi Kode
                </Button>
              )}

              {verified && (
                <>
                  <div className="rounded-md border border-primary/30 bg-accent p-3.5">
                    <div className="flex items-center gap-2 text-[12px] font-medium text-primary-dark">
                      <CheckCircle2 className="h-4 w-4" /> Kode akses valid
                    </div>
                    <p className="mt-2 text-[15px] font-semibold text-foreground">{verified.orgName}</p>
                    <p className="text-[12px] text-muted-foreground">
                      Tingkat {verified.tingkat} · {verified.pw} · berlaku s.d.{" "}
                      {new Date(verified.expiredAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <Button onClick={lanjut} className="h-11 w-full">
                    Lanjut Isi Data Administrator <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              <details className="rounded-md border border-border bg-secondary/40 p-3 text-[12px] text-muted-foreground">
                <summary className="cursor-pointer font-medium text-foreground">Kode demo</summary>
                <p className="mt-1.5 font-mono">DGD-MN8P-3KLR · DGD-2C7J-BVQK · DGD-T5Z9-MWPE</p>
              </details>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/cek-status" className="text-[12px] font-medium text-primary hover:underline">
              Cek status pengajuan
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
