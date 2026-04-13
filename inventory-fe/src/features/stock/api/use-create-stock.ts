import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiResponse } from "@/types/common";
import type { StockInfo, StockType } from "../types";

type CreateStockPayload = {
  modelNumber: string;
  description?: string;
  brand?: string;
  quantity?: number;
  uom: string;
  projectType?: string;
  type?: StockType;
  minStockLevel?: number;
  locations: { locationId: string; quantity: number }[];
};

type CreateStockResponse = ApiResponse<StockInfo>;

const useCreateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStockPayload) => {
      const { data, error } = await $fetch<CreateStockResponse>("/stocks", {
        method: "POST",
        body: payload,
      });

      if (error) {
        throw error;
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
};

export { useCreateStock };
export type { CreateStockPayload, CreateStockResponse };
