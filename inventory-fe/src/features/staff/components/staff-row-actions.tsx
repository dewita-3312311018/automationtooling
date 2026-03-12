import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useDeleteUser } from "../api/use-delete-user";
import { useChangePassword } from "../api/use-change-password";
import { useAssignRole } from "../api/use-assign-role";
import { useRoles } from "../../rbac/api/use-roles";
import type { UserInfo } from "../types";

interface StaffRowActionsProps {
  user: UserInfo;
}

function StaffRowActions({ user }: StaffRowActionsProps) {
  const [action, setAction] = useState<"PASSWORD" | "ROLE" | "DELETE" | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  const { data: roles } = useRoles();

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();
  const { mutate: assignRole, isPending: isAssigningRole } = useAssignRole();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setAction(null);
      setNewPassword("");
      setSelectedRoleId("");
    }
  };

  const onSubmit = () => {
    if (action === "DELETE") {
      deleteUser(user.id, {
        onSuccess: () => {
          toast.success("User deleted successfully");
          handleOpenChange(false);
        },
        onError: (err) => toast.error(err.message || "Failed to delete user"),
      });
    } else if (action === "PASSWORD") {
      if (!newPassword || newPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      changePassword(
        { username: user.username, password: newPassword },
        {
          onSuccess: () => {
            toast.success("Password updated successfully");
            handleOpenChange(false);
          },
          onError: (err) => toast.error(err.message || "Failed to update password"),
        },
      );
    } else if (action === "ROLE") {
      if (!selectedRoleId) {
        toast.error("Please select a role");
        return;
      }
      assignRole(
        { userId: user.id, roleId: selectedRoleId },
        {
          onSuccess: () => {
            toast.success(user.role ? "Role updated successfully" : "Role assigned successfully");
            handleOpenChange(false);
          },
          onError: (err) => toast.error(err.message || (user.role ? "Failed to update role" : "Failed to assign role")),
        },
      );
    }
  };

  const isPending = isDeleting || isChangingPassword || isAssigningRole;

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
          <DropdownMenuItem onClick={() => setAction("ROLE")}>
            {user.role ? "Update Role" : "Assign Role"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setAction("PASSWORD")}>Change Password</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setAction("DELETE")}
          >
            Delete Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={action !== null} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "DELETE" && "Delete User Account"}
              {action === "PASSWORD" && "Change Administrator Password"}
              {action === "ROLE" && (user.role ? "Update Permission Role" : "Assign Permission Role")}
            </DialogTitle>
            <DialogDescription>
              {action === "DELETE" &&
                `Are you sure you want to permanently delete ${user.name}? This action cannot be undone.`}
              {action === "PASSWORD" && `Enter a new secure password for ${user.username}.`}
              {action === "ROLE" &&
                (user.role
                  ? `Select a new RBAC role to assign to ${user.name}.`
                  : `Select an RBAC role to assign to ${user.name}.`)}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 p-4">
            {action === "PASSWORD" && (
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
            )}

            {action === "ROLE" && (
              <div className="grid gap-2">
                <Label htmlFor="role">Select Role</Label>
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.items?.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={isPending}
              variant={action === "DELETE" ? "destructive" : "default"}
              onClick={onSubmit}
            >
              {isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { StaffRowActions };
