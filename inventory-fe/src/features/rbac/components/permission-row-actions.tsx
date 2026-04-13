import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { PermissionDialog } from "./permission-dialog.tsx";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useDeletePermission } from "../api/use-delete-permission";
import type { PermissionInfo } from "../api/use-permissions";
import type { Row } from "@tanstack/react-table";

interface PermissionRowActionsProps {
  row: Row<PermissionInfo>;
}

function PermissionRowActions({ row }: PermissionRowActionsProps) {
  const permission = row.original;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: deletePermission, isPending: isDeleting } = useDeletePermission();


  const handleDelete = () => {
    deletePermission(permission.id, {
      onSuccess: () => {
        toast.success("Permission deleted successfully");
        setIsDeleteDialogOpen(false);
      },
      onError: (err: { message?: string }) => toast.error(err.message || "Failed to delete permission"),
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
            Edit Permission
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Permission
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PermissionDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        permission={permission}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
        title="Delete Permission"
        description={`Are you sure you want to delete the permission "${permission.name}" ? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </>
  );
}

export { PermissionRowActions };
