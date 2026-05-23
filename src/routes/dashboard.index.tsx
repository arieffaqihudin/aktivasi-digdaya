import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const user = useStore((s) => s.user);
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={user.role === "Super Admin" ? "/dashboard/admin" : "/dashboard/review"} />;
}
