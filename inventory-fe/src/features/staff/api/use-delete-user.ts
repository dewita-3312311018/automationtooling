import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiResponse } from "@/types/common";
import type { UserInfo } from "../types";

function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await $fetch<ApiResponse<UserInfo>>(`/users/${id}`, {
        method: "DELETE",
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

export { useDeleteUser };
