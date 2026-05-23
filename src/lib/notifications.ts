import { useEffect, useSyncExternalStore } from "react";
import { useStore, type Role } from "./store";

export type NotifType =
  | "NEW_SUBMISSION"
  | "APPROVED"
  | "REVISION_REQUESTED"
  | "REVISION_SUBMITTED"
  | "REJECTED_FINAL"
  | "SLA_WARNING"
  | "SLA_OVERDUE"
  | "ACCESS_CODE_CREATED"
  | "PERURI_EXPORT_READY"
  | "SYSTEM";

export type NotifRole = "REVIEWER" | "OPS" | "PW" | "PC";

export interface Notification {
  id: string;
  recipientRole: NotifRole;
  /** For PW/PC, the org id this notification is scoped to. */
  recipientOrgId?: string;
  type: NotifType;
  title: string;
  description: string;
  ticketId?: string;
  route?: string;
  isRead: boolean;
  createdAt: string;
}

const STORAGE_KEY = "digdaya-notifications-v1";

interface NotifState {
  items: Notification[];
}

function initial(): NotifState {
  return { items: [] };
}

const serverSnapshot = initial();
let state: NotifState = initial();
let hydrated = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function load(): NotifState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial();
    return { ...initial(), ...JSON.parse(raw) };
  } catch {
    return initial();
  }
}

function hydrate() {
  if (typeof window === "undefined" || hydrated) return;
  hydrated = true;
  state = load();
  emit();
}

function setState(patch: Partial<NotifState> | ((s: NotifState) => Partial<NotifState>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  persist();
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useNotificationStore<T>(selector: (s: NotifState) => T): T {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => serverSnapshot,
  );
  useEffect(() => {
    hydrate();
  }, []);
  return selector(snapshot);
}

function newId() {
  return "n" + Math.random().toString(36).slice(2, 10);
}

/** Map app Role → NotifRole(s) for filtering visibility. */
export function roleToNotifRole(role: Role): NotifRole {
  if (role === "Super Admin") return "OPS";
  if (role === "Reviewer") return "REVIEWER";
  if (role === "PW") return "PW";
  return "PC";
}

export const notifActions = {
  add(input: Omit<Notification, "id" | "isRead" | "createdAt"> & { isRead?: boolean }) {
    const n: Notification = {
      id: newId(),
      isRead: false,
      createdAt: new Date().toISOString(),
      ...input,
    };
    setState((s) => ({ items: [n, ...s.items].slice(0, 500) }));
    return n;
  },
  /** Broadcast to multiple recipient roles in one call. */
  broadcast(
    bases: Array<Omit<Notification, "id" | "isRead" | "createdAt">>,
  ) {
    const created = bases.map((b) => ({
      id: newId(),
      isRead: false,
      createdAt: new Date().toISOString(),
      ...b,
    }));
    setState((s) => ({ items: [...created, ...s.items].slice(0, 500) }));
  },
  markRead(id: string) {
    setState((s) => ({ items: s.items.map((n) => (n.id === id ? { ...n, isRead: true } : n)) }));
  },
  markAllRead(role: NotifRole, orgId?: string) {
    setState((s) => ({
      items: s.items.map((n) =>
        n.recipientRole === role && (!orgId || !n.recipientOrgId || n.recipientOrgId === orgId)
          ? { ...n, isRead: true }
          : n,
      ),
    }));
  },
  clearAll() {
    setState({ items: [] });
  },
};

/** Hook returning the notifications visible to the current user. */
export function useMyNotifications(): Notification[] {
  const user = useStore((s) => s.user);
  const items = useNotificationStore((s) => s.items);
  if (!user) return [];
  const role = roleToNotifRole(user.role);
  const orgId = user.role === "PC" ? user.pcId : user.role === "PW" ? user.pwId : undefined;
  return items.filter((n) => {
    if (n.recipientRole !== role) return false;
    if (n.recipientOrgId && orgId && n.recipientOrgId !== orgId) return false;
    return true;
  });
}

/** Icon background tone for a notification type. */
export function notifTone(type: NotifType): "green" | "softGreen" | "yellow" | "red" | "softRed" | "gray" {
  switch (type) {
    case "NEW_SUBMISSION":
    case "REVISION_SUBMITTED":
      return "softGreen";
    case "APPROVED":
    case "PERURI_EXPORT_READY":
    case "ACCESS_CODE_CREATED":
      return "green";
    case "REVISION_REQUESTED":
    case "SLA_WARNING":
      return "yellow";
    case "REJECTED_FINAL":
      return "softRed";
    case "SLA_OVERDUE":
      return "red";
    default:
      return "gray";
  }
}

export function notifCategory(type: NotifType): "submission" | "revision" | "sla" | "system" {
  switch (type) {
    case "NEW_SUBMISSION":
    case "APPROVED":
    case "REJECTED_FINAL":
      return "submission";
    case "REVISION_REQUESTED":
    case "REVISION_SUBMITTED":
      return "revision";
    case "SLA_WARNING":
    case "SLA_OVERDUE":
      return "sla";
    default:
      return "system";
  }
}

export function formatRelative(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Baru saja";
  if (min < 60) return `${min} mnt lalu`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} jam lalu`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}
