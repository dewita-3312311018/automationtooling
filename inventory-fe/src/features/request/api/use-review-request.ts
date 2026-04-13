import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiResponse } from "@/types/common";
import type { ReviewRequestPayload, RequestInfo } from "../types";

function useReviewRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: ReviewRequestPayload & { id: string }) => {
      const { data, error } = await $fetch<ApiResponse<RequestInfo>>(`/requests/${id}/review`, {
        method: "PUT",
        body: payload,
      });

      if (error) {
        throw error;
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export { useReviewRequest };
