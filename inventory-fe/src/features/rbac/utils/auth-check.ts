import { queryClient } from "@/lib/query-client";
import { $fetch } from "@/config/fetch";
import type { ApiResponse } from "@/types/common";
import type { MyPermissionsResponse } from "@/features/rbac/api/use-my-permissions";

async function checkPermission(permission: string): Promise<boolean> {
  try {
    const response = await queryClient.ensureQueryData({
      queryKey: ["my-permissions"],
      queryFn: async () => {
        const { data, error } = await $fetch<ApiResponse<MyPermissionsResponse>>("/rbac/me/permissions");
        if (error) throw error;
        return data.data;
      },
    });

    if (!response) return false;

    return response.permissions.includes(permission);
  } catch (err) {
    console.error("Permission check failed:", err);
    return false;
  }
}

export { checkPermission };
