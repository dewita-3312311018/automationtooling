import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiResponse } from "@/types/common";
import type { RequestInfo } from "../types";

function useRequest(id: string) {
  return useQuery({
    queryKey: ["requests", id],
    queryFn: async () => {
      const { data, error } = await $fetch<ApiResponse<RequestInfo>>(`/requests/${id}`);

      if (error) {
        throw error;
      }

      return data.data;
    },
    enabled: !!id,
  });
}

export { useRequest };
