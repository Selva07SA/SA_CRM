import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

type Props = {
  allowedSystemRoles?: Array<"USER" | "SYSTEM_ADMIN">;
  allowedRoleIds?: string[];
};

export const RoleRoute = ({ allowedSystemRoles, allowedRoleIds }: Props) => {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;

  const systemOk = !allowedSystemRoles || allowedSystemRoles.includes(user.systemRole);
  const tenantOk = !allowedRoleIds || allowedRoleIds.some((id) => user.roleIds?.includes(id));

  if (!systemOk || !tenantOk) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};
