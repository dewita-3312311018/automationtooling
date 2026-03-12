import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ProfileResponse } from "../types";

type UpdateProfilePayload = {
  name?: string;
  username?: string;
};

function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data, error } = await $fetch<ProfileResponse>("/users/profile", {
        method: "PATCH",
        body: payload,
      });

      if (error) {
        throw error;
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export { useUpdateProfile };
export type { UpdateProfilePayload };
