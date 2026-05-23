import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/NotificationsPage";

export const Route = createFileRoute("/ops/activation/notifications")({
  component: NotificationsPage,
});
