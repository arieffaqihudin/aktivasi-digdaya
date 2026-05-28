import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { NotificationItem } from "@/components/NotificationBell";
import { notifActions, notifCategory, useMyNotifications, roleToNotifRole } from "@/lib/notifications";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Bell, CheckCheck } from "lucide-react";

type FilterKey = "all" | "unread" | "submission" | "revision" | "system";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "unread", label: "Belum Dibaca" },
  { key: "submission", label: "Pengajuan" },
  { key: "revision", label: "Perbaikan" },
  { key: "system", label: "Sistem" },
];

export function NotificationsPage() {
  const user = useStore((s) => s.user);
  const items = useMyNotifications();
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = items.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    return notifCategory(n.type) === filter;
  });

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <div>
      <PageHeader
        title="Notifikasi"
        subtitle="Aktivitas dan pembaruan terkait pengajuan, perbaikan, SLA, dan sistem."
        count={items.length}
        action={
          <button
            onClick={() => {
              if (!user) return;
              const role = roleToNotifRole(user.role);
              const orgId = user.role === "PC" ? user.pcId : user.role === "PW" ? user.pwId : undefined;
              notifActions.markAllRead(role, orgId);
            }}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-[12px] font-semibold text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:text-muted-foreground"
          >
            <CheckCheck className="h-4 w-4" /> Tandai Semua Dibaca
          </button>
        }
      />
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:bg-secondary",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <Bell className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-[13px] text-muted-foreground">Belum ada notifikasi.</p>
            </div>
          ) : (
            <ul>
              {filtered.map((n) => (
                <NotificationItem
                  key={n.id}
                  n={n}
                  onClick={() => notifActions.markRead(n.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
