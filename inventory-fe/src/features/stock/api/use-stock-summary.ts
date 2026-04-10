import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";

export type StockSummary = {
  totalStocks: number;
  lowStockAlerts: number;
  technicalItems: number;
  pendingRequests: number;
};

export const useStockSummary = () => {
  return useQuery({
    queryKey: ["stocks", "summary"],
    queryFn: async () => {
      const { data, error } = await $fetch<{ data: StockSummary }>("/stocks/summary");
      if (error) throw error;
      return data.data;
    },
  });
};
