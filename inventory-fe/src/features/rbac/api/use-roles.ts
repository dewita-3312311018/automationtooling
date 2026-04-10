import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiPaginatedResponse } from "@/types/common";
import type { RoleInfo } from "../../staff/types";

interface UseRolesParams {
  page?: number;
  limit?: number;
  search?: string;
}

function useRoles(params?: UseRolesParams) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const search = params?.search;

  return useQuery({
    queryKey: ["roles", page, limit, search],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) searchParams.append("search", search);

      const { data, error } = await $fetch<ApiPaginatedResponse<RoleInfo>>(
        `/rbac/roles?${searchParams.toString()}`,
      );

      if (error) {
        throw error;
      }

      return data.data;
    },
  });
}

export { useRoles };
export type { UseRolesParams };
