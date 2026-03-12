import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";

type UpdatePermissionPayload = {
  id: string;
  name?: string;
  description?: string;
};

const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdatePermissionPayload) => {
      const { data, error } = await $fetch<{ data: any }>(`/rbac/permissions/${id}`, {
        method: "PATCH",
        body: payload,
      });
      if (error) throw error;
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
};

export { useUpdatePermission };
