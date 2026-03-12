import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import type { RoleInfo } from "@/features/staff/types";
import type { PermissionInfo } from "./use-permissions";

export type RoleWithPermissions = RoleInfo & {
  permissions: PermissionInfo[];
};

const useRole = (id: string | null) => {
  return useQuery({
    queryKey: ["roles", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await $fetch<{ data: RoleWithPermissions }>(`/rbac/roles/${id}`);
      if (error) throw error;
      return data.data;
    },
    enabled: !!id,
  });
};

export { useRole };
