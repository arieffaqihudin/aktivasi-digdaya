import { createFileRoute } from "@tanstack/react-router";
import { useStore, actions } from "@/lib/store";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Switch } from "@/components/ui/switch";
import { Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin/notifikasi")({
  component: NotifConfig,
});

function NotifConfig() {
  const notif = useStore((s) => s.notif);
  return (
    <div>
      <PageHeader title="Konfigurasi Notifikasi" subtitle="Atur channel notifikasi kepada pengurus dan tim internal." />
      <div className="px-6 pb-10">
        <div className="max-w-2xl space-y-3">
          <Channel
            icon={Mail}
            title="Email"
            desc="Notifikasi status pendaftaran melalui email."
            active={notif.emailEnabled}
            badge="Aktif Phase 1"
            badgeTone="bg-success/15 text-success border-success/30"
            onChange={(v: boolean) => { actions.updateNotif({ emailEnabled: v }); toast.success("Konfigurasi diperbarui."); }}
          />
          <Channel
            icon={MessageCircle}
            title="WhatsApp / Qiscus"
            desc="Notifikasi otomatis via WhatsApp Business API."
            active={notif.whatsappEnabled}
            badge="Phase 2"
            badgeTone="bg-warning/15 text-warning-foreground border-warning/30"
            onChange={(v: boolean) => { actions.updateNotif({ whatsappEnabled: v }); toast.message("Channel WhatsApp akan diaktifkan pada Phase 2."); }}
          />
        </div>
      </div>
    </div>
  );
}

function Channel({ icon: Icon, title, desc, active, badge, badgeTone, onChange }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; active: boolean; badge: string; badgeTone: string; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
        <div>
          <div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{title}</h3>
            <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${badgeTone}`}>{badge}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Switch checked={active} onCheckedChange={onChange} />
    </div>
  );
}
