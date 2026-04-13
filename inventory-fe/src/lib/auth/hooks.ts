import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import { setAccessToken, setRefreshToken, clearTokens } from "./index";

type LoginPayload = {
  username: string;
  password: string;
};

type LoginResponse = {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
};

function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data, error } = await $fetch<{ data: LoginResponse }>("/auth/login", {
        method: "POST",
        body: payload,
      });

      if (error) {
        throw error;
      }

      return data.data;
    },
    onSuccess: (data) => {
      setAccessToken(data.token);
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
      }
    },
  });
}

function useLogout() {
  const handleLogout = useCallback(() => {
    clearTokens();
    window.location.href = "/login";
  }, []);

  return { logout: handleLogout };
}

export { useLogin, useLogout };
