import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/aktivasi")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/aktivasi" || location.pathname === "/aktivasi/") {
      throw redirect({ to: "/kode-akses" });
    }
  },
  component: () => <Outlet />,
});
