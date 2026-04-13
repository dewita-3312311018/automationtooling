import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiPaginatedResponse } from "@/types/common";
import type { RequestInfo, RequestStatus, RequestType } from "../types";

type UseMyRequestsOptions = {
  page?: number;
  limit?: number;
  status?: RequestStatus;
  type?: RequestType;
  search?: string;
};

function useMyRequests(options?: UseMyRequestsOptions) {
  return useQuery({
    queryKey: ["my-requests", options],
    queryFn: async () => {
      const { data, error } = await $fetch<ApiPaginatedResponse<RequestInfo>>("/requests/my-requests", {
        query: options as Record<string, unknown>,
      });

      if (error) {
        throw error;
      }

      return data.data;
    },
  });
}

export { useMyRequests };
export type { UseMyRequestsOptions };
