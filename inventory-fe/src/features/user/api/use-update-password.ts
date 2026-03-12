import { useMutation } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import { toast } from "sonner";
import { z } from "zod";

const updatePasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

function useUpdatePassword() {
  return useMutation({
    mutationFn: async (data: UpdatePasswordInput) => {
      const { data: resData, error } = await $fetch("/users/profile/change-password", {
        method: "POST",
        body: data,
      });

      if (error) {
        throw error;
      }

      return resData;
    },
    onSuccess: () => {
      toast.success("Password updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update password");
    },
  });
}

export { useUpdatePassword };
export type { UpdatePasswordInput };
