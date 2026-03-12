import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiResponse } from "@/types/common";
import type { StockInfo } from "../types";

function useStock({ id, enabled = true }: { id: string; enabled?: boolean }) {
  return useQuery({
    queryKey: ["stock", id],
    queryFn: async () => {
      const { data, error } = await $fetch<ApiResponse<StockInfo>>(`/stocks/${id}`);

      if (error) {
        throw error;
      }

      return data.data;
    },
    enabled: enabled && !!id,
  });
}

export { useStock };
