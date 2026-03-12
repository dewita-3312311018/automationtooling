import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiPaginatedResponse } from "@/types/common";
import type { RoleInfo } from "../../staff/types";

function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await $fetch<ApiPaginatedResponse<RoleInfo>>("/rbac/roles");

      if (error) {
        throw error;
      }

      return data.data;
    },
  });
}

export { useRoles };
