import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/store/authStore";

export const useLogin = () => {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user
      });
    }
  });
};

export const useRegister = () => {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user
      });
    }
  });
};
