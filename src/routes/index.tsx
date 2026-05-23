import { createFileRoute } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { AktivasiForm, CekStatusForm } from "@/components/public/PublicForms";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { KeyRound, Search } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portal Aktivasi Digdaya" },
      { name: "description", content: "Aktivasi administrator Digdaya untuk kepengurusan NU melalui kode akses resmi PBNU." },
      { property: "og:title", content: "Portal Aktivasi Digdaya" },
      { property: "og:description", content: "Aktivasi administrator Digdaya untuk kepengurusan NU." },
    ],
  }),
  component: Home,
});

type Tab = "aktivasi" | "cek-status";

function Home() {
  const [tab, setTab] = useState<Tab>("aktivasi");

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

          <div className="mt-7 rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-2 border-b border-border">
              <TabBtn active={tab === "aktivasi"} onClick={() => setTab("aktivasi")} icon={<KeyRound className="h-4 w-4" />}>
                Aktivasi PC
              </TabBtn>
              <TabBtn active={tab === "cek-status"} onClick={() => setTab("cek-status")} icon={<Search className="h-4 w-4" />}>
                Cek Status
              </TabBtn>
            </div>
            <div className="p-6 sm:p-7">
              {tab === "aktivasi" ? <AktivasiForm /> : <CekStatusForm />}
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function TabBtn({
  active, onClick, icon, children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-3.5 text-[13px] font-medium transition-colors",
        active
          ? "bg-accent text-primary-dark border-b-2 border-primary"
          : "text-muted-foreground hover:text-foreground border-b-2 border-transparent",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
