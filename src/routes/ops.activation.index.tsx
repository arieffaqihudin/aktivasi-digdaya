import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ops/activation/")({
  beforeLoad: () => {
    throw redirect({ to: "/ops" });
  },
});
