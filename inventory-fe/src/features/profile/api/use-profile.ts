import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ProfileResponse } from "../types";

function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await $fetch<ProfileResponse>("/users/profile");

      if (error) {
        throw error;
      }

      return data.data;
    },
  });
}

export { useProfile };
