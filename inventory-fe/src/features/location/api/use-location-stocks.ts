import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { StockInfo } from "../../stock/types";
import type { LocationInfo } from "../api/use-locations";

type LocationStocksResponse = {
  data: {
    location: LocationInfo;
    stocks: StockInfo[];
  };
};

function useLocationStocks(id: string | null) {
  return useQuery({
    queryKey: ["locations", id, "stocks"],
    queryFn: async () => {
      const { data, error } = await $fetch<LocationStocksResponse>(`/locations/${id}/stocks`);

      if (error) {
        throw error;
      }

      return data.data;
    },
    enabled: !!id,
  });
}

export { useLocationStocks };
export type { LocationStocksResponse };
