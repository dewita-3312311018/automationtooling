import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";

type AssignPermissionPayload = {
  roleId: string;
  permissionId: string;
};

const useAssignPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AssignPermissionPayload) => {
      const { error } = await $fetch("/rbac/roles/assign-permission", {
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

export { useAssignPermission };
