import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiPaginatedResponse } from "@/types/common";
import type { RequestInfo, RequestStatus } from "../types";

type UseRequestsOptions = {
  page?: number;
  limit?: number;
  status?: RequestStatus;
  search?: string;
};

function useRequests(options?: UseRequestsOptions) {
  return useQuery({
    queryKey: ["requests", options],
    queryFn: async () => {
      const { data, error } = await $fetch<ApiPaginatedResponse<RequestInfo>>("/requests", {
        query: options as Record<string, unknown>,
      });

      if (error) {
        throw error;
      }

      return data.data;
    },
    placeholderData: keepPreviousData,
  });
}

export { useRequests };
export type { UseRequestsOptions };
