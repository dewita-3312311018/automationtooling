import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { LocationInfo } from "./use-locations";

type LocationResponse = {
  data: LocationInfo;
};

const useLocation = (id?: string) => {
  return useQuery({
    queryKey: ["location", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await $fetch<LocationResponse>(`/locations/${id}`);

      if (error) {
        throw error;
      }

      return data?.data;
    },
    enabled: !!id,
  });
};

export { useLocation };
