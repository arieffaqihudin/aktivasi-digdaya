import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { getState } from "@/lib/store";
import { toast } from "sonner";
import { Search } from "lucide-react";

export const Route = createFileRoute("/cek-status")({
  head: () => ({
    meta: [
      { title: "Cek Status Pendaftaran — Portal Aktivasi Digdaya" },
      { name: "description", content: "Pantau status pendaftaran administrator Digdaya menggunakan nomor tiket." },
    ],
  }),
  component: CekStatus,
});

function CekStatus() {
  const [tiket, setTiket] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = tiket.trim().toUpperCase();
    if (!t) return;
    const found = getState().registrations.find((r) => r.ticketId.toUpperCase() === t);
    if (!found) {
      toast.error("Nomor tiket tidak ditemukan.");
      return;
    }
    navigate({ to: "/status/$ticketId", params: { ticketId: found.ticketId } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Cek Status Pendaftaran</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masukkan nomor tiket pendaftaran untuk melihat status terkini.
          </p>
          <form onSubmit={submit} className="mt-6 rounded-xl border border-border bg-card p-5">
            <Label htmlFor="tiket" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nomor Tiket
            </Label>
            <Input
              id="tiket"
              value={tiket}
              onChange={(e) => setTiket(e.target.value)}
              placeholder="AKT-2026-000123"
              className="mt-1.5 font-mono"
              autoFocus
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Contoh format: AKT-2026-000101
            </p>
            <Button type="submit" className="mt-4 w-full">
              <Search className="mr-2 h-4 w-4" /> Cek Status
            </Button>
          </form>

          <div className="mt-5 rounded-md border border-border bg-secondary/40 p-4 text-xs text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">Contoh tiket untuk demo:</p>
            <ul className="space-y-1 font-mono">
              <li>AKT-2026-000101 — Pending</li>
              <li>AKT-2026-000103 — Approved</li>
              <li>AKT-2026-000106 — Rejected</li>
            </ul>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
