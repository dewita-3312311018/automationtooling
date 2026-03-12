import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiPaginatedResponse } from "@/types/common";
import type { UserInfo } from "../types";

interface UseUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

function useUsers(params?: UseUsersParams) {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const search = params?.search;

  return useQuery({
    queryKey: ["users", { page, limit, search }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) searchParams.append("search", search);

      const { data, error } = await $fetch<ApiPaginatedResponse<UserInfo>>(
        `/users?${searchParams.toString()}`
      );

      if (error) {
        throw error;
      }

      return data.data;
    },
  });
}

export { useUsers };
