import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const permissionKeys = useAuthStore((s) => s.permissionKeys);
  const clearSession = useAuthStore((s) => s.clearSession);
  const hasPermission = (permission: string) => permissionKeys.includes(permission);
  return { user, isAuthenticated, permissionKeys, hasPermission, clearSession };
};
