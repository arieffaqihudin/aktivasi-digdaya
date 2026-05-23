import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/audit-log")({
  beforeLoad: () => { throw redirect({ to: "/ops/activation/audit-log" }); },
});
