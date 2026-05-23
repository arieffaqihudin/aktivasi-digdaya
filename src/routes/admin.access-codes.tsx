import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/access-codes")({
  beforeLoad: () => { throw redirect({ to: "/ops/activation/access-codes" }); },
});
