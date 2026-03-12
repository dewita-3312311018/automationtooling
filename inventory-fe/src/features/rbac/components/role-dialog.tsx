import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RolePermissionsDialog } from "./role-permissions-dialog.tsx";
import { ConfirmDialog } from "@/components/confirm-dialog";
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
import { Badge } from "@/components/ui/badge";
import { Settings2 } from "lucide-react";
import { useCreateRole } from "../api/use-create-role";
import { useUpdateRole } from "../api/use-update-role";
import { useRole } from "../api/use-role";
import { useRemovePermission } from "../api/use-remove-permission";
import type { RoleInfo } from "@/features/staff/types";

const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type RoleSchema = z.infer<typeof roleSchema>;

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: RoleInfo;
}

function RoleDialog({ open, onOpenChange, role }: RoleDialogProps) {
  const { mutate: createRole, isPending: isCreating } = useCreateRole();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();

  // Hooks for editing role permissions
  const { data: roleData, isLoading: isLoadingRole } = useRole(role?.id || null);
  const { mutate: removePermission, isPending: isRemoving } = useRemovePermission();
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<{ id: string; name: string } | null>(null);

  const form = useForm<RoleSchema>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (role && open) {
      form.reset({
        name: role.name,
        description: role.description || "",
      });
    } else if (!open) {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [role, open, form]);

  const onSubmit = (values: RoleSchema) => {
    if (role) {
      updateRole(
        { id: role.id, ...values },
        {
          onSuccess: () => {
            toast.success("Role updated successfully");
            onOpenChange(false);
          },
          onError: (err: { message?: string }) => toast.error(err.message || "Failed to update role"),
        }
      );
    } else {
      createRole(values, {
        onSuccess: () => {
          toast.success("Role created successfully");
          onOpenChange(false);
        },
        onError: (err: { message?: string }) => toast.error(err.message || "Failed to create role"),
      });
    }
  };

  const handleRemovePermission = () => {
    if (!role || !permissionToDelete) return;
    removePermission({ roleId: role.id, permissionId: permissionToDelete.id }, {
      onSuccess: () => {
        toast.success("Permission removed");
        setPermissionToDelete(null);
      },
      onError: (err: { message?: string }) => toast.error(err.message || "Failed to remove permission"),
    });
  };

  const isPending = isCreating || isUpdating;
  const assignedPermissionIds = roleData?.permissions.map(p => p.id) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create New Role"}</DialogTitle>
          <DialogDescription>
            {role
              ? "Update role details and manage permissions."
              : "Define a new role and assign permissions later."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4" id="role-form">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Warehouse Manager" {...field} />
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
                        placeholder="e.g. Full access to inventory and locations"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {role && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Permissions</h4>
                </div>

                <div className="flex flex-wrap gap-2">
                  {roleData?.permissions.map((p) => (
                    <Badge key={p.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                      {p.name}
                      <button
                        type="button"
                        onClick={() => setPermissionToDelete({ id: p.id, name: p.name })}
                        className="p-0.5 hover:bg-muted rounded-full transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {assignedPermissionIds.length === 0 && !isLoadingRole && (
                    <span className="text-xs text-muted-foreground italic">No permissions assigned</span>
                  )}
                  {isLoadingRole && <span className="text-xs animate-pulse">Loading permissions...</span>}
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={() => setIsPermissionsDialogOpen(true)}
                >
                  <Settings2 className="h-4 w-4" />
                  Manage Permissions
                </Button>
              </div>
            )}


          </form>
        </Form>
        <DialogFooter className="pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} form="role-form">
            {isPending ? "Saving..." : role ? "Update Role" : "Create Role"}
          </Button>
        </DialogFooter>
        {role && (
          <RolePermissionsDialog
            role={role}
            open={isPermissionsDialogOpen}
            onOpenChange={setIsPermissionsDialogOpen}
            assignedPermissionIds={assignedPermissionIds}
          />
        )}
        <ConfirmDialog
          open={permissionToDelete !== null}
          onOpenChange={(open) => !open && setPermissionToDelete(null)}
          onConfirm={handleRemovePermission}
          isLoading={isRemoving}
          variant="destructive"
          title="Remove Permission"
          description={`Are you sure you want to remove "${permissionToDelete?.name}" from this role?`}
          confirmLabel="Remove"
        />
      </DialogContent>
    </Dialog>
  );
}

export { RoleDialog };
