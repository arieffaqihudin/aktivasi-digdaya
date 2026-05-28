import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/aktivasi/sukses/$ticketId")({
  head: ({ params }) => ({
    meta: [
      { title: `Pengajuan ${params.ticketId} Berhasil — Portal Aktivasi Digdaya` },
      { name: "description", content: "Konfirmasi pengajuan aktivasi administrator." },
    ],
  }),
  component: SuksesPage,
});

function SuksesPage() {
  const { ticketId } = Route.useParams();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 px-4 py-14">
        <div className="mx-auto w-full max-w-[560px] rounded-xl border border-border bg-card p-7 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-9">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-5 text-[20px] font-bold tracking-tight text-foreground sm:text-[22px]">
            Pengajuan Aktivasi Berhasil Dikirim
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Simpan nomor tiket berikut untuk mengecek status pengajuan Anda.
          </p>

          <div className="mt-5 rounded-md border border-border bg-secondary/40 px-6 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Nomor Tiket
            </p>
            <p className="mt-1 font-mono text-[24px] font-bold text-primary-dark">{ticketId}</p>
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1.5 text-[12px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Pengajuan akan direview oleh Tim Digdaya
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={() => navigate({ to: "/status/$ticketId", params: { ticketId } })}>
              Cek Status Pengajuan
            </Button>
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">Kembali ke Portal</Button>
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
