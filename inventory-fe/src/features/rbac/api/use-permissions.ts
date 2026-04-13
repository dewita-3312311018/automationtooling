import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiPaginatedResponse } from "@/types/common";

interface UsePermissionsParams {
  page?: number;
  limit?: number;
  search?: string;
}

const usePermissions = (params?: UsePermissionsParams) => {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const search = params?.search;

  return useQuery({
    queryKey: ["permissions", page, limit, search],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) searchParams.append("search", search);

      const { data, error } = await $fetch<ApiPaginatedResponse<PermissionInfo>>(
        `/rbac/permissions?${searchParams.toString()}`
      );

      if (error) throw error;
      return data.data;
    },
  });
};

type PermissionInfo = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export { usePermissions };
export type { PermissionInfo };
