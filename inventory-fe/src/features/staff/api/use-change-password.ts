import { useMutation } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiResponse } from "@/types/common";
import type { UserInfo } from "../types";

function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: { username: string; password: string }) => {
      const { data, error } = await $fetch<ApiResponse<{ message: string; user: UserInfo }>>(
        "/users/change-password",
        {
          method: "POST",
          body: payload,
        },
      );

      if (error) {
        throw error;
      }

      return data.data;
    },
  });
}

export { useChangePassword };
