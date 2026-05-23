import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  CheckCheck,
  Inbox,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  KeyRound,
  FileDown,
  Bell as BellIcon,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  notifActions,
  notifTone,
  formatRelative,
  useMyNotifications,
  roleToNotifRole,
  type Notification,
  type NotifType,
} from "@/lib/notifications";
import { useStore } from "@/lib/store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const TYPE_ICON: Record<NotifType, React.ComponentType<{ className?: string }>> = {
  NEW_SUBMISSION: Inbox,
  APPROVED: CheckCircle2,
  REVISION_REQUESTED: AlertTriangle,
  REVISION_SUBMITTED: RefreshCcw,
  REJECTED_FINAL: XCircle,
  SLA_WARNING: Clock,
  SLA_OVERDUE: Clock,
  ACCESS_CODE_CREATED: KeyRound,
  PERURI_EXPORT_READY: FileDown,
  SYSTEM: BellIcon,
};

const TONE_BG: Record<ReturnType<typeof notifTone>, string> = {
  softGreen: "bg-primary/10 text-primary",
  green: "bg-primary/15 text-primary",
  yellow: "bg-amber-100 text-amber-700",
  red: "bg-destructive/15 text-destructive",
  softRed: "bg-destructive/10 text-destructive",
  gray: "bg-secondary text-muted-foreground",
};

function notifAllRoute(role: ReturnType<typeof roleToNotifRole>): string {
  switch (role) {
    case "REVIEWER":
      return "/review/notifications";
    case "OPS":
      return "/ops/activation/notifications";
    case "PW":
      return "/pw/notifications";
    case "PC":
      return "/pc/notifications";
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const user = useStore((s) => s.user);
  const all = useMyNotifications();
  const unread = all.filter((n) => !n.isRead).length;
  const recent = all.slice(0, 8);

  if (!user) return null;
  const role = roleToNotifRole(user.role);
  const allRoute = notifAllRoute(role);
  const orgId = user.role === "PC" ? user.pcId : user.role === "PW" ? user.pwId : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Notifikasi"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground ring-2 ring-card">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(360px,calc(100vw-1.5rem))] p-0"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-[13px] font-semibold text-foreground">Notifikasi</p>
          <button
            onClick={() => notifActions.markAllRead(role, orgId)}
            disabled={unread === 0}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Tandai Semua Dibaca
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
              <Bell className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-[13px] text-muted-foreground">Belum ada notifikasi.</p>
            </div>
          ) : (
            <ul>
              {recent.map((n) => (
                <NotificationItem
                  key={n.id}
                  n={n}
                  onClick={() => {
                    notifActions.markRead(n.id);
                    setOpen(false);
                  }}
                />
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-border px-4 py-2.5 text-center">
          <Link
            to={allRoute}
            onClick={() => setOpen(false)}
            className="text-[12px] font-semibold text-primary hover:underline"
          >
            Lihat Semua Notifikasi
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function NotificationItem({
  n,
  onClick,
}: {
  n: Notification;
  onClick?: () => void;
}) {
  const Icon = TYPE_ICON[n.type] ?? BellIcon;
  const toneClass = TONE_BG[notifTone(n.type)];
  const body = (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 transition-colors hover:bg-secondary/60",
        !n.isRead && "bg-primary/[0.04]",
      )}
    >
      <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", toneClass)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("truncate text-[13px] leading-tight", n.isRead ? "font-medium text-foreground/90" : "font-semibold text-foreground")}>
            {n.title}
          </p>
          {!n.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">{n.description}</p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground/80">{formatRelative(n.createdAt)}</span>
          {n.route && (
            <span className="text-[11px] font-semibold text-primary">Lihat Detail →</span>
          )}
        </div>
      </div>
    </div>
  );
  if (n.route) {
    return (
      <li className="border-b border-border last:border-0">
        <Link to={n.route} onClick={onClick} className="block">
          {body}
        </Link>
      </li>
    );
  }
  return (
    <li className="border-b border-border last:border-0">
      <button onClick={onClick} className="block w-full text-left">
        {body}
      </button>
    </li>
  );
}
