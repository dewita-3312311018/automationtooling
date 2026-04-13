import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiPaginatedResponse } from "@/types/common";
import type { NotificationInfo } from "../types";

function useNotifications(options?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["notifications", options],
    queryFn: async () => {
      const { data, error } = await $fetch<ApiPaginatedResponse<NotificationInfo>>("/notifications", {
        query: options as Record<string, unknown>,
      });

      if (error) {
        throw error;
      }

      return data.data;
    },
    refetchInterval: 30000,
  });
}

export { useNotifications };
