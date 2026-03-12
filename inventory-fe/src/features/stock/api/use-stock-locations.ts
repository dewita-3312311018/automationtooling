import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiResponse } from "@/types/common";
import type { StockLocation } from "../types";

function useStockLocations({ id, enabled = true }: { id: string; enabled?: boolean }) {
  return useQuery({
    queryKey: ["stockLocations", id],
    queryFn: async () => {
      const { data, error } = await $fetch<ApiResponse<StockLocation[]>>(`/stocks/${id}/locations`);

      if (error) {
        throw error;
      }

      return data.data;
    },
    enabled: enabled && !!id,
  });
}

export { useStockLocations };
