import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { ApiResponse } from "@/types/common";

interface MyPermissionsResponse {
  role: string | null;
  permissions: string[];
}

const useMyPermissions = () => {
  return useQuery({
    queryKey: ["my-permissions"],
    queryFn: async () => {
      const { data, error } = await $fetch<ApiResponse<MyPermissionsResponse>>("/rbac/me/permissions");
      if (error) throw error;
      return data.data;
    },
  });
};

export { useMyPermissions };
export type { MyPermissionsResponse };
