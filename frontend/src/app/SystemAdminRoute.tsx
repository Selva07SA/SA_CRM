import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export const SystemAdminRoute = () => {
  const user = useAuthStore((s) => s.user);

  if (user?.systemRole !== "SYSTEM_ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
