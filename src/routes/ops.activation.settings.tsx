import { createFileRoute } from "@tanstack/react-router";
import { OpsPageHeader, OpsPageBody, OpsCard } from "@/components/ops/OpsPageHeader";
import { actions, useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/ops/activation/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const sla = useStore((s) => s.sla);
  const notif = useStore((s) => s.notif);
  const [draft, setDraft] = useState(sla);

  const save = () => { actions.updateSLA(draft); toast.success("Pengaturan disimpan."); };

  return (
    <div>
      <OpsPageHeader title="Pengaturan Aktivasi" subtitle="Atur kode akses, SLA review, revisi, dan kanal notifikasi." breadcrumb={[{ label: "Aktivasi Digdaya", to: "/ops/activation" }, { label: "Pengaturan Aktivasi" }]} />
      <OpsPageBody>
        <div className="grid gap-5 lg:grid-cols-2">
          <OpsCard title="Kode Akses">
            <Row label="Default Masa Berlaku (hari)">
              <Input type="number" min={1} value={draft.defaultCodeValidDays} onChange={(e) => setDraft({ ...draft, defaultCodeValidDays: Number(e.target.value) })} />
            </Row>
            <p className="mt-3 text-[12px] text-muted-foreground">Mode default: <span className="font-medium text-foreground">Scoped Batch Code</span>. Whitelist manual diizinkan.</p>
          </OpsCard>

          <OpsCard title="SLA Review">
            <Row label="SLA default (hari kerja)">
              <Input type="number" min={1} value={draft.defaultDays} onChange={(e) => setDraft({ ...draft, defaultDays: Number(e.target.value) })} />
            </Row>
            <Row label="Threshold Hijau (<)">
              <Input type="number" min={0} value={draft.greenMaxDays} onChange={(e) => setDraft({ ...draft, greenMaxDays: Number(e.target.value) })} />
            </Row>
            <Row label="Threshold Kuning (≤)">
              <Input type="number" min={0} value={draft.yellowMaxDays} onChange={(e) => setDraft({ ...draft, yellowMaxDays: Number(e.target.value) })} />
            </Row>
          </OpsCard>

          <OpsCard title="Revisi">
            <Row label="Maksimal jumlah revisi">
              <Input type="number" min={1} value={draft.maxRevisions} onChange={(e) => setDraft({ ...draft, maxRevisions: Number(e.target.value) })} />
            </Row>
            <p className="mt-3 text-[12px] text-muted-foreground">Super Admin selalu dapat melakukan override.</p>
          </OpsCard>

          <OpsCard title="Notifikasi">
            <Row label="Email Penerima Internal">
              <Input value={draft.notifyEmails} onChange={(e) => setDraft({ ...draft, notifyEmails: e.target.value })} />
            </Row>
            <div className="mt-3 flex items-center justify-between rounded-md border border-border p-3">
              <div><p className="text-sm font-medium">Email</p><p className="text-xs text-muted-foreground">Status pengajuan via email.</p></div>
              <Switch checked={notif.emailEnabled} onCheckedChange={(v) => actions.updateNotif({ emailEnabled: v })} />
            </div>
            <div className="mt-2 flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <div className="flex items-center gap-2"><p className="text-sm font-medium">WhatsApp / Qiscus</p>
                  <span className="rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning-foreground">Phase 2</span>
                </div>
                <p className="text-xs text-muted-foreground">Notifikasi via WhatsApp Qiscus.</p>
              </div>
              <Switch checked={notif.whatsappEnabled} onCheckedChange={(v) => actions.updateNotif({ whatsappEnabled: v })} />
            </div>
          </OpsCard>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDraft(sla)}>Batal</Button>
          <Button onClick={save}>Simpan Pengaturan</Button>
        </div>
      </OpsPageBody>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
