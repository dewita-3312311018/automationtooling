import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";

type AssignRolePayload = {
  userId: string;
  roleId: string;
};

const useAssignRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AssignRolePayload) => {
      const { error } = await $fetch("/rbac/users/assign-role", {
        method: "POST",
        body: payload,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};

export { useAssignRole };
