import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { LocationInfo } from "./use-locations";

type UpdateLocationPayload = {
  id: string;
  name?: string;
  description?: string;
  floor?: string;
};

type UpdateLocationResponse = {
  data: LocationInfo;
};

const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateLocationPayload) => {
      const { data, error } = await $fetch<UpdateLocationResponse>(`/locations/${id}`, {
        method: "PATCH",
        body: payload,
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

export { useUpdateLocation };
export type { UpdateLocationPayload, UpdateLocationResponse };
