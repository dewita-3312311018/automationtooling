import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { LocationInfo } from "./use-locations";

type DeleteLocationResponse = {
  data: LocationInfo;
};

const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await $fetch<DeleteLocationResponse>(`/locations/${id}`, {
        method: "DELETE",
      });

      if (error) {
        throw error;
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};

export { useDeleteLocation };
export type { DeleteLocationResponse };
