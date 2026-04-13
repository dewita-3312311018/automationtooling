import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { LocationInfo } from "./use-locations";

type CreateLocationPayload = {
  name: string;
  description?: string;
  floor?: string;
};

type CreateLocationResponse = {
  data: LocationInfo;
};

const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLocationPayload) => {
      const { data, error } = await $fetch<CreateLocationResponse>("/locations", {
        method: "POST",
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

export { useCreateLocation };
export type { CreateLocationPayload, CreateLocationResponse };
