import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/pc/surat-tugas")({
  component: PcSuratTugas,
});

function PcSuratTugas() {
  return (
    <div>
      <PageHeader
        title="Surat Tugas dari Persuratan"
        breadcrumb={[{ label: "PC", to: "/pc" }, { label: "Dokumen" }, { label: "Surat Tugas" }]}
        subtitle="Daftar surat tugas yang terhubung dari Digdaya Persuratan."
      />
      <div className="p-4 sm:p-6">
        <div className="max-w-2xl rounded-xl border border-border bg-card p-6 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-base font-semibold">Integrasi Digdaya Persuratan</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Fitur ini akan menampilkan daftar surat tugas yang tersedia dari Digdaya Persuratan untuk dipakai pada pengajuan aktivasi.
          </p>
          <Link to="/pc" className="mt-4 inline-block">
            <Button variant="outline" size="sm">Kembali ke Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
