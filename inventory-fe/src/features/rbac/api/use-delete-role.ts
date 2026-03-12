import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";

const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await $fetch<{ data: any }>(`/rbac/roles/${id}`, {
        method: "DELETE",
      });
      if (error) throw error;
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export { useDeleteRole };
