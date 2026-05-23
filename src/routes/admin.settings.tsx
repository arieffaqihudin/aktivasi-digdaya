import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { actions, useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: Settings,
});

function Settings() {
  const sla = useStore((s) => s.sla);
  const notif = useStore((s) => s.notif);
  const [draft, setDraft] = useState(sla);

  const save = () => { actions.updateSLA(draft); toast.success("Konfigurasi disimpan."); };

  return (
    <div>
      <PageHeader title="Konfigurasi" subtitle="Atur kode akses, SLA review, dan kanal notifikasi." />
      <div className="grid gap-5 p-6 lg:grid-cols-2">
        <Card title="Kode Akses & SLA Review">
          <Row label="Default Masa Berlaku Kode (hari)">
            <Input type="number" min={1} value={draft.defaultCodeValidDays} onChange={(e) => setDraft({ ...draft, defaultCodeValidDays: Number(e.target.value) })} />
          </Row>
          <Row label="SLA Review (hari kerja)">
            <Input type="number" min={1} value={draft.defaultDays} onChange={(e) => setDraft({ ...draft, defaultDays: Number(e.target.value) })} />
          </Row>
          <Row label="Threshold Hijau (<)">
            <Input type="number" min={0} value={draft.greenMaxDays} onChange={(e) => setDraft({ ...draft, greenMaxDays: Number(e.target.value) })} />
          </Row>
          <Row label="Threshold Kuning (≤)">
            <Input type="number" min={0} value={draft.yellowMaxDays} onChange={(e) => setDraft({ ...draft, yellowMaxDays: Number(e.target.value) })} />
          </Row>
          <Row label="Email Penerima Notifikasi Internal">
            <Input value={draft.notifyEmails} onChange={(e) => setDraft({ ...draft, notifyEmails: e.target.value })} />
          </Row>
          <Button className="mt-2" onClick={save}>Simpan Konfigurasi</Button>
        </Card>

        <Card title="Kanal Notifikasi">
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-muted-foreground">Pengumuman status pendaftaran via email.</p>
            </div>
            <Switch checked={notif.emailEnabled} onCheckedChange={(v) => actions.updateNotif({ emailEnabled: v })} />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div className="flex items-start gap-2">
              <div>
                <div className="flex items-center gap-2"><p className="text-sm font-medium">WhatsApp / Qiscus</p>
                  <span className="rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning-foreground">Phase 2</span>
                </div>
                <p className="text-xs text-muted-foreground">Notifikasi real-time via WhatsApp Qiscus.</p>
              </div>
            </div>
            <Switch checked={notif.whatsappEnabled} onCheckedChange={(v) => actions.updateNotif({ whatsappEnabled: v })} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="mb-4 text-sm font-semibold">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
