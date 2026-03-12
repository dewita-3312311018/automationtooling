import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";

function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { userId: string; roleId: string }) => {
      const { data, error } = await $fetch<{ data: any }>("/rbac/users/assign-role", {
        method: "POST",
        body: payload,
      });

      if (error) {
        throw error;
      }

      return data.data;
    },
    onSuccess: () => {
      // Typically we invalidate users or roles to see updated state
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export { useAssignRole };
