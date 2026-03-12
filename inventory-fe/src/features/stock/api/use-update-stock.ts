import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiResponse } from "@/types/common";
import type { StockInfo } from "../types";
import type { StockFormValues } from "../components/stock-form";

function useUpdateStock(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<StockFormValues>) => {
      const { data: response, error } = await $fetch<ApiResponse<StockInfo>>(`/stocks/${id}`, {
        method: "PUT",
        body: data,
      });

      if (error) {
        throw error;
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["stock", id] });
    },
  });
}

export { useUpdateStock };
