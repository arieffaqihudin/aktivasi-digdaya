import { createFileRoute } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { AktivasiForm } from "@/components/public/PublicForms";

export const Route = createFileRoute("/aktivasi")({
  head: () => ({
    meta: [
      { title: "Aktivasi PC — Portal Aktivasi Digdaya" },
      { name: "description", content: "Aktivasi administrator PC melalui kode akses resmi PBNU." },
    ],
  }),
  component: Aktivasi,
});

function Aktivasi() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 px-4 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-[560px]">
          <div className="text-center">
            <h1 className="text-[22px] font-bold tracking-tight text-foreground sm:text-[24px]">
              Aktivasi Administrator Digdaya
            </h1>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Masukkan kode akses dari PBNU untuk memulai proses aktivasi.
            </p>
          </div>
          <div className="mt-7 rounded-xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-7">
            <AktivasiForm />
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
