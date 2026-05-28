import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Search, XCircle, FileText, Hash, MapPin, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/ops/persuratan/cek-order-id")({
  component: CekOrderIdPage,
});

interface SuratData {
  letterId: string;
  orderId: string;
  nomorSurat: string;
  perihal: string;
  lokasi: string;
  tanggalRilisHijriah: string;
  tanggalRilisMasehi: string;
}

const MOCK_SURAT: SuratData[] = [
  {
    letterId: "66b8ef82-b77c-46db-a797-e3fbef3d3afc",
    orderId: "37393099",
    nomorSurat: "347/PB.23/B.I.03.08/99/05/2026",
    perihal: "Letter of Support for Italian Visa Application",
    lokasi: "Jakarta",
    tanggalRilisHijriah: "10-12-1447",
    tanggalRilisMasehi: "27-05-2026",
  },
  {
    letterId: "a53f57ba-a0f8-478d-a44c-8a19f6d9b7a3",
    orderId: "37161016",
    nomorSurat: "332/PB.01/A.II.06.03/99/05/2026",
    perihal: "Surat Tugas Tim Survei Lokasi Munas dan Konbes 2026",
    lokasi: "Jakarta",
    tanggalRilisHijriah: "05-12-1447",
    tanggalRilisMasehi: "22-05-2026",
  },
];

function isValidLetterIdFormat(id: string): boolean {
  // Allow UUID-like format or at least 8 chars
  return id.trim().length >= 8;
}

function CekOrderIdPage() {
  const [letterId, setLetterId] = useState("");
  const [searchedId, setSearchedId] = useState("");
  const [foundSurat, setFoundSurat] = useState<SuratData | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = () => {
    setError("");
    setFoundSurat(null);
    setSearched(false);

    if (!letterId.trim()) {
      setError("Letter ID wajib diisi.");
      return;
    }

    if (!isValidLetterIdFormat(letterId.trim())) {
      setError("Format Letter ID tidak valid.");
      return;
    }

    const normalized = letterId.trim().toLowerCase();
    const surat = MOCK_SURAT.find(
      (s) => s.letterId.toLowerCase() === normalized
    );

    setSearchedId(letterId.trim());
    setSearched(true);

    if (surat) {
      setFoundSurat(surat);
    }
  };

  const handleReset = () => {
    setSearched(false);
    setFoundSurat(null);
    setError("");
    // Keep input filled as recommended
  };

  const infoRow = (label: string, value: string, icon: React.ReactNode) => (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground break-words">
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <OpsPageHeader
        title="Cek Order ID"
        subtitle="Cari informasi surat berdasarkan Letter ID."
        breadcrumb={[
          { label: "Overview", to: "/ops" },
          { label: "Persuratan" },
          { label: "Cek Order ID" },
        ]}
      />
      <OpsPageBody>
        {/* Search Card */}
        <OpsCard>
          <div className="space-y-4">
            <div>
              <Label htmlFor="letterId" className="text-sm font-medium">
                Cari Order ID Surat Berdasarkan Letter ID
              </Label>
              <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                <div className="flex-1">
                  <Input
                    id="letterId"
                    type="text"
                    placeholder="Masukkan Letter ID"
                    value={letterId}
                    onChange={(e) => {
                      setLetterId(e.target.value);
                      if (error) setError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    className="h-10"
                  />
                  {error && (
                    <p className="mt-1.5 flex items-center gap-1 text-[12px] text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {error}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleSearch}
                  className="h-10 w-full sm:w-auto shrink-0"
                >
                  <Search className="mr-1.5 h-4 w-4" />
                  Cari
                </Button>
              </div>
            </div>
          </div>
        </OpsCard>

        {/* Not Found State */}
        {searched && !foundSurat && (
          <OpsCard className="border-dashed">
            <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
              <XCircle className="h-10 w-10 text-muted-foreground/60" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Data tidak ditemukan
                </p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  Surat dengan Letter ID tersebut tidak ditemukan. Pastikan data yang dimasukkan sudah benar.
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground/70">
                  Dicari: {searchedId}
                </p>
              </div>
            </div>
          </OpsCard>
        )}

        {/* Informasi Surat */}
        {foundSurat && (
          <OpsCard title="Informasi Surat">
            <div className="space-y-4">
              {infoRow(
                "Order Id",
                foundSurat.orderId,
                <Hash className="h-4 w-4 text-muted-foreground" />
              )}
              {infoRow(
                "Nomor Surat",
                foundSurat.nomorSurat,
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
              {infoRow(
                "Perihal",
                foundSurat.perihal,
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
              {infoRow(
                "Lokasi",
                foundSurat.lokasi,
                <MapPin className="h-4 w-4 text-muted-foreground" />
              )}
              {infoRow(
                "Tanggal Rilis Hijriah",
                foundSurat.tanggalRilisHijriah,
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              )}
              {infoRow(
                "Tanggal Rilis Masehi",
                foundSurat.tanggalRilisMasehi,
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Divider */}
            <div className="my-5 h-px bg-border" />

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Kembali
              </Button>
            </div>
          </OpsCard>
        )}
      </OpsPageBody>
    </div>
  );
}
