import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { NotificationInfo } from "../types";

function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await $fetch<{ data: NotificationInfo }>(
        `/notifications/${id}/read`,
        {
          method: "PUT",
        },
      );

      if (error) {
        throw error;
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export { useMarkRead };
