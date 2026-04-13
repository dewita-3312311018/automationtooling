import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";

type CreatePermissionPayload = {
  name: string;
  description?: string;
};

const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePermissionPayload) => {
      const { data, error } = await $fetch<{ data: any }>("/rbac/permissions", {
        method: "POST",
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

export { useCreatePermission };
