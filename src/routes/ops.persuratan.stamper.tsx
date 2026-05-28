import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, XCircle, AlertCircle, Mail, User, Stamp } from "lucide-react";
import { isValidEmail } from "@/utils/validation";

export const Route = createFileRoute("/ops/persuratan/stamper")({
  component: StamperPage,
});

type StamperStatus = "Aktif" | "Belum Aktif";

interface StamperUser {
  email: string;
  nama: string;
  statusStamper: StamperStatus;
}

const MOCK_USERS: StamperUser[] = [
  { email: "arief.faqihudin@gmail.com", nama: "Arief Faqihudin", statusStamper: "Aktif" },
  { email: "reviewer@digdaya.nu.id", nama: "Reviewer Tim Digdaya", statusStamper: "Belum Aktif" },
  { email: "admin@digdaya.nu.id", nama: "Admin Digdaya", statusStamper: "Aktif" },
  { email: "ops.persuratan@digdaya.nu.id", nama: "Admin Ops Persuratan", statusStamper: "Belum Aktif" },
];

function StamperPage() {
  const [email, setEmail] = useState("");
  const [searchedEmail, setSearchedEmail] = useState("");
  const [foundUser, setFoundUser] = useState<StamperUser | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = () => {
    setError("");
    setFoundUser(null);
    setSearched(false);

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError("Format email tidak valid.");
      return;
    }

    const normalized = email.trim().toLowerCase();
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === normalized);

    setSearchedEmail(email.trim());
    setSearched(true);

    if (user) {
      setFoundUser(user);
    }
  };

  const handleReset = () => {
    setEmail("");
    setSearchedEmail("");
    setFoundUser(null);
    setSearched(false);
    setError("");
  };

  const toggleStamper = () => {
    if (!foundUser) return;

    const newStatus: StamperStatus = foundUser.statusStamper === "Aktif" ? "Belum Aktif" : "Aktif";

    // Update local state
    setFoundUser((prev) => (prev ? { ...prev, statusStamper: newStatus } : null));

    // Also update mock data so re-search reflects the change
    const idx = MOCK_USERS.findIndex((u) => u.email.toLowerCase() === foundUser.email.toLowerCase());
    if (idx !== -1) {
      MOCK_USERS[idx].statusStamper = newStatus;
    }

    if (newStatus === "Aktif") {
      toast.success("Stamper berhasil diaktifkan.");
    } else {
      toast.success("Stamper berhasil dinonaktifkan.");
    }
  };

  const isActive = foundUser?.statusStamper === "Aktif";

  return (
    <div>
      <OpsPageHeader
        title="Stamper"
        subtitle="Cari pengguna berdasarkan email untuk mengaktifkan atau menonaktifkan stamper."
        breadcrumb={[
          { label: "Overview", to: "/ops" },
          { label: "Persuratan" },
          { label: "Stamper" },
        ]}
      />
      <OpsPageBody>
        {/* Search Card */}
        <OpsCard>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Cari Email Pengguna
              </Label>
              <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                <div className="flex-1">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Masukkan email pengguna"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
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
        {searched && !foundUser && (
          <OpsCard className="border-dashed">
            <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
              <XCircle className="h-10 w-10 text-muted-foreground/60" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Pengguna tidak ditemukan
                </p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  Pastikan email yang dimasukkan benar.
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground/70">
                  Dicari: {searchedEmail}
                </p>
              </div>
            </div>
          </OpsCard>
        )}

        {/* User Info Panel */}
        {foundUser && (
          <OpsCard title="Informasi Pengguna">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Left column */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Email
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-foreground break-all">
                      {foundUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Nama Lengkap
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">
                      {foundUser.nama}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Stamp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Status Stamper
                    </p>
                    <div className="mt-1.5">
                      {isActive ? (
                        <Badge className="bg-[oklch(0.94_0.06_150)] text-[oklch(0.36_0.10_152)] hover:bg-[oklch(0.94_0.06_150)] border-none">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-muted-foreground">
                          Belum Aktif
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="my-5 h-px bg-border" />

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
              <Button
                onClick={toggleStamper}
                variant={isActive ? "destructive" : "default"}
                className="w-full sm:w-auto"
              >
                {isActive ? "Nonaktifkan Stamper" : "Aktifkan Stamper"}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Batal
              </Button>
            </div>
          </OpsCard>
        )}
      </OpsPageBody>
    </div>
  );
}
