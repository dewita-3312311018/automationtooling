import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";

type RemovePermissionPayload = {
  roleId: string;
  permissionId: string;
};

const useRemovePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RemovePermissionPayload) => {
      const { error } = await $fetch("/rbac/roles/remove-permission", {
        method: "POST",
        body: payload,
      });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roles", variables.roleId] });
    },
  });
};

export { useRemovePermission };
