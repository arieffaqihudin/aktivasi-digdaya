import { createFileRoute } from "@tanstack/react-router";
import { useStore, actions } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin/sla")({
  component: SLAConfig,
});

function SLAConfig() {
  const sla = useStore((s) => s.sla);
  const [form, setForm] = useState(sla);
  useEffect(() => setForm(sla), [sla]);

  const save = () => { actions.updateSLA(form); toast.success("Konfigurasi SLA diperbarui."); };

  return (
    <div>
      <PageHeader title="Konfigurasi SLA" subtitle="Atur batas waktu review dan threshold SLA." />
      <div className="px-6 pb-10">
        <div className="max-w-2xl space-y-5 rounded-xl border border-border bg-card p-6">
          <Row label="Default SLA review (hari kerja)">
            <Input type="number" min={1} value={form.defaultDays} onChange={(e) => setForm({ ...form, defaultDays: +e.target.value })} />
          </Row>
          <Row label="Threshold hijau (< … hari)">
            <Input type="number" min={0} step="0.5" value={form.greenMaxDays} onChange={(e) => setForm({ ...form, greenMaxDays: +e.target.value })} />
          </Row>
          <Row label="Threshold kuning (… hari)">
            <Input type="number" min={1} value={form.yellowMaxDays} onChange={(e) => setForm({ ...form, yellowMaxDays: +e.target.value })} />
          </Row>
          <Row label="Email penerima notifikasi internal" helper="Pisahkan dengan koma untuk lebih dari satu email.">
            <Input value={form.notifyEmails} onChange={(e) => setForm({ ...form, notifyEmails: e.target.value })} />
          </Row>
          <div className="flex justify-end pt-3 border-t border-border"><Button onClick={save}>Simpan Konfigurasi</Button></div>
        </div>
      </div>
    </div>
  );
}
function Row({ label, children, helper }: { label: string; children: React.ReactNode; helper?: string }) {
  return (
    <div>
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}
