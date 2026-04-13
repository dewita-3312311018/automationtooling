import { useMutation } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiResponse } from "@/types/common";
import { setAccessToken } from "@/lib/auth";
import type { LoginCredentials } from "../types";

function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data, error } = await $fetch<ApiResponse<LoginData>>("/auth/login", {
        method: "POST",
        body: credentials,
      });

      if (error) {
        throw error;
      }

      const loginData = data.data;
      setAccessToken(loginData.token);
      
      return loginData;
    },
  });
}

type LoginData = {
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
  };
  token: string;
};

export { useLogin };
export type { LoginData };
