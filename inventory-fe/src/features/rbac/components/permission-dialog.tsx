import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePermission } from "../api/use-create-permission";
import { useUpdatePermission } from "../api/use-update-permission";
import type { PermissionInfo } from "../api/use-permissions";

const permissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type PermissionSchema = z.infer<typeof permissionSchema>;

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission?: PermissionInfo;
}

function PermissionDialog({ open, onOpenChange, permission }: PermissionDialogProps) {
  const { mutate: createPermission, isPending: isCreating } = useCreatePermission();
  const { mutate: updatePermission, isPending: isUpdating } = useUpdatePermission();

  const form = useForm<PermissionSchema>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (permission && open) {
      form.reset({
        name: permission.name,
        description: permission.description || "",
      });
    } else if (!open) {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [permission, open, form]);

  const onSubmit = (values: PermissionSchema) => {
    if (permission) {
      updatePermission(
        { id: permission.id, ...values },
        {
          onSuccess: () => {
            toast.success("Permission updated successfully");
            onOpenChange(false);
          },
          onError: (err: { message?: string }) => toast.error(err.message || "Failed to update permission"),
        }
      );
    } else {
      createPermission(values, {
        onSuccess: () => {
          toast.success("Permission created successfully");
          onOpenChange(false);
        },
        onError: (err: { message?: string }) => toast.error(err.message || "Failed to create permission"),
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{permission ? "Edit Permission" : "Create New Permission"}</DialogTitle>
          <DialogDescription>
            {permission
              ? "Update the details of this security permission."
              : "Define a new action-based permission for roles."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="permission-form" className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permission Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. inventory:write" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Allows user to create and edit stock items"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} form="permission-form">
            {isPending ? "Saving..." : permission ? "Update Permission" : "Create Permission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { PermissionDialog };
