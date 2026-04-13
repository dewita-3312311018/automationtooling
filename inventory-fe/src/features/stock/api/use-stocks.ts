import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiPaginatedResponse } from "@/types/common";
import type { StockInfo } from "../types";

type UseStocksOptions = {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
};

const useStocks = (options?: UseStocksOptions) => {
  return useQuery({
    queryKey: ["stocks", options],
    queryFn: async () => {
      const { data, error } = await $fetch<ApiPaginatedResponse<StockInfo>>("/stocks", {
        query: options as Record<string, unknown>,
      });

      if (error) {
        throw error;
      }

      return data.data;
    },
  });
};

export { useStocks };
export type { UseStocksOptions };
