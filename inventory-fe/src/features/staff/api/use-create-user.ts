import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiResponse } from "@/types/common";
import type { UserInfo } from "../types";

function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: Omit<UserInfo, "id" | "createdAt" | "updatedAt" | "role"> & { password?: string },
    ) => {
      const { data, error } = await $fetch<ApiResponse<UserInfo>>("/auth/register", {
        method: "POST",
        body: payload,
      });

      if (error) {
        throw error;
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export { useCreateUser };
