import { useMutation, useQueryClient } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";

type CreateRolePayload = {
  name: string;
  description?: string;
};

const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRolePayload) => {
      const { data, error } = await $fetch<{ data: any }>("/rbac/roles", {
        method: "POST",
        body: payload,
      });
      if (error) throw error;
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export { useCreateRole };
