import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiPaginatedResponse } from "@/types/common";
import type { AuditInfo } from "../types";

interface UseAuditsOptions {
  page?: number;
  limit?: number;
  search?: string;
}

function useAudits({ page = 1, limit = 10, search }: UseAuditsOptions = {}) {
  return useQuery({
    queryKey: ["audits", { page, limit, search }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) searchParams.set("search", search);

      const { data, error } = await $fetch<ApiPaginatedResponse<AuditInfo>>(`/audits?${searchParams.toString()}`);

      if (error) {
        throw error;
      }

      return data.data;
    },
    placeholderData: keepPreviousData,
  });
}

export { useAudits };
