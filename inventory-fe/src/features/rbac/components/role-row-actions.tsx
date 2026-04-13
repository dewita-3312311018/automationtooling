import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleDialog } from "./role-dialog.tsx";
import { RolePermissionsDrawer } from "./role-permissions-drawer.tsx";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useDeleteRole } from "../api/use-delete-role";
import type { RoleInfo } from "@/features/staff/types";
import type { Row } from "@tanstack/react-table";

interface RoleRowActionsProps {
  row: Row<RoleInfo>;
}

function RoleRowActions({ row }: RoleRowActionsProps) {
  const role = row.original;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();

  const handleDelete = () => {
    deleteRole(role.id, {
      onSuccess: () => {
        toast.success("Role deleted successfully");
        setIsDeleteDialogOpen(false);
      },
      onError: (err: { message?: string }) => toast.error(err.message || "Failed to delete role"),
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Role
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDrawerOpen(true)}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            View Permissions
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Role
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RoleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        role={role}
      />

      <RolePermissionsDrawer
        role={role}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
        title="Delete Role"
        description={`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </>
  );
}

export { RoleRowActions };
