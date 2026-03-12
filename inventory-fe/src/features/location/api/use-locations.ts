import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiPaginatedResponse } from "@/types/common";

type LocationInfo = {
  id: string;
  name: string;
  description?: string;
  floor?: string;
  createdAt: string;
  updatedAt: string;
};

const useLocations = (options?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ["locations", options],
    queryFn: async () => {
      const { data, error } = await $fetch<ApiPaginatedResponse<LocationInfo>>("/locations", {
        query: options as Record<string, unknown>,
      });

      if (error) {
        throw error;
      }

      return data?.data;
    },
    placeholderData: keepPreviousData,
  });
};

export { useLocations };
export type { LocationInfo };
