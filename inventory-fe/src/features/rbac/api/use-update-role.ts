import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";

type UpdateRolePayload = {
  id: string;
  name?: string;
  description?: string;
};

const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateRolePayload) => {
      const { data, error } = await $fetch<{ data: any }>(`/rbac/roles/${id}`, {
        method: "PATCH",
        body: payload,
      });
      if (error) throw error;
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles", variables.id] });
    },
  });
};

export { useUpdateRole };
