import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { actions, type VerifyResult } from "@/lib/store";
import {
  KeyRound,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Building2,
  Info,
} from "lucide-react";
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
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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

  const isScoped = verified?.kind === "Scoped";

  const eligible = useMemo(() => {
    if (!verified || !isScoped) return [];
    return actions.getEligibleOrgsForCode(verified);
  }, [verified, isScoped]);

  const filteredEligible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return eligible;
    return eligible.filter((o) => o.nama.toLowerCase().includes(q));
  }, [eligible, search]);

  const selectedOrg = eligible.find((o) => o.id === selectedOrgId) ?? null;

  const lanjut = () => {
    if (!verified) return;
    if (isScoped) {
      if (!selectedOrgId) return;
      navigate({
        to: "/aktivasi/$accessCode",
        params: { accessCode: verified.code },
        search: { org: selectedOrgId },
      });
    } else {
      navigate({ to: "/aktivasi/$accessCode", params: { accessCode: verified.code } });
    }
  };

  const reset = () => {
    setVerified(null);
    setSelectedOrgId(null);
    setSearch("");
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 px-4 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-[640px]">
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
                  onChange={(e) => { setCode(e.target.value); setError(null); if (verified) reset(); }}
                  placeholder="ONBOARD-PC-DIY-MEI2026"
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
                <div className="rounded-md border border-primary/30 bg-accent p-3.5">
                  <div className="flex items-center gap-2 text-[12px] font-medium text-primary-dark">
                    <CheckCircle2 className="h-4 w-4" /> Kode akses valid
                  </div>
                  <p className="mt-2 text-[15px] font-semibold text-foreground">
                    {verified.batchName ?? verified.orgName}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    Tingkat {verified.tingkat} ·{" "}
                    {verified.scope?.wilayahPwId === "Nasional" ? "Nasional" : verified.pw} · berlaku s.d.{" "}
                    {new Date(verified.expiredAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  {isScoped && (
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {eligible.filter((o) => !o.hasActiveSubmission).length} kepengurusan tersedia
                    </p>
                  )}
                </div>
              )}

              {verified && isScoped && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">Pilih Kepengurusan Anda</h3>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      Silakan pilih kepengurusan sesuai surat tugas yang akan diunggah. Daftar ini hanya
                      menampilkan kepengurusan yang belum aktif di Digdaya.
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari nama kepengurusan"
                      className="h-10 pl-9"
                    />
                  </div>

                  {filteredEligible.length === 0 ? (
                    <div className="rounded-md border border-border bg-secondary/40 p-4 text-center text-[13px] text-muted-foreground">
                      Tidak ada kepengurusan yang tersedia untuk kode akses ini. Semua kepengurusan dalam
                      scope ini mungkin sudah aktif atau sedang dalam proses aktivasi.
                    </div>
                  ) : (
                    <div className="max-h-[280px] divide-y divide-border overflow-y-auto rounded-md border border-border">
                      {filteredEligible.map((o) => {
                        const disabled = o.hasActiveSubmission;
                        const selected = o.id === selectedOrgId;
                        return (
                          <button
                            key={o.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => setSelectedOrgId(o.id)}
                            className={[
                              "flex w-full items-start gap-3 px-3.5 py-3 text-left text-[13px] transition",
                              disabled
                                ? "cursor-not-allowed bg-muted/30 text-muted-foreground"
                                : selected
                                  ? "bg-accent text-foreground"
                                  : "bg-card hover:bg-secondary/60",
                            ].join(" ")}
                          >
                            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground break-words [overflow-wrap:anywhere]">{o.nama}</p>
                              <p className="text-[11px] text-muted-foreground break-words [overflow-wrap:anywhere]">
                                Tingkat {o.tingkat} · {o.pwName}
                              </p>
                              {disabled && (
                                <span className="mt-1.5 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                  Sudah ada pengajuan
                                </span>
                              )}
                            </div>
                            {selected && !disabled && (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            )}
                          </button>

                        );
                      })}
                    </div>
                  )}

                  {selectedOrg && (
                    <div className="rounded-md border border-primary/30 bg-accent/60 p-3.5 sm:p-4">
                      <p className="text-[12px] font-semibold text-primary-dark">
                        Pastikan kepengurusan yang dipilih sudah benar.
                      </p>
                      <dl className="mt-2 grid grid-cols-1 gap-x-3 gap-y-2 text-[12px] sm:grid-cols-[auto_1fr] sm:gap-y-1.5">
                        <dt className="text-muted-foreground">Nama</dt>
                        <dd className="font-medium text-foreground break-words [overflow-wrap:anywhere]">{selectedOrg.nama}</dd>
                        <dt className="text-muted-foreground">Tingkat</dt>
                        <dd className="font-medium text-foreground">{selectedOrg.tingkat}</dd>
                        <dt className="text-muted-foreground">Wilayah</dt>
                        <dd className="font-medium text-foreground break-words [overflow-wrap:anywhere]">{selectedOrg.pwName}</dd>
                        <dt className="text-muted-foreground">Status</dt>
                        <dd className="font-medium text-foreground">Belum Production</dd>
                      </dl>
                      <div className="mt-3 flex items-start gap-2 rounded-sm border border-border bg-card/60 p-2.5 text-[11px] text-muted-foreground">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>
                          Surat tugas yang diunggah harus sesuai dengan kepengurusan yang dipilih. Jika
                          tidak sesuai, pengajuan dapat diminta perbaikan oleh reviewer.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {verified && (
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <Button variant="outline" onClick={reset} className="h-11 w-full sm:w-auto">
                    Ganti Kode
                  </Button>
                  <Button
                    onClick={lanjut}
                    disabled={isScoped && !selectedOrgId}
                    className="h-11 w-full sm:flex-1"
                  >
                    <span className="sm:hidden">Lanjut Isi Data</span>
                    <span className="hidden sm:inline">Lanjut Isi Data Administrator</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}


              <details className="rounded-md border border-border bg-secondary/40 p-3 text-[12px] text-muted-foreground">
                <summary className="cursor-pointer font-medium text-foreground">Kode demo</summary>
                <div className="mt-2 space-y-1 font-mono text-[11px]">
                  <p><strong>Scoped batch:</strong> ONBOARD-PC-DIY-MEI2026 · ONBOARD-PC-JATENG-01 · ONBOARD-PW-NASIONAL</p>
                  <p><strong>Individual:</strong> AKSES-PC-001 · AKSES-PW-001</p>
                  <p><strong>Error:</strong> AKSES-EXP-001 (expired) · AKSES-DIS-001 (disabled) · AKSES-USED-001 (used)</p>
                </div>
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
