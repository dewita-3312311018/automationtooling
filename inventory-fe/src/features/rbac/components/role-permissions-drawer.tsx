import { useState } from "react";
import { Search, Loader2, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRole } from "../api/use-role";
import { useRemovePermission } from "../api/use-remove-permission";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { RoleInfo } from "@/features/staff/types";

interface RolePermissionsDrawerProps {
  role: RoleInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function RolePermissionsDrawer({ role, open, onOpenChange }: RolePermissionsDrawerProps) {
  const [search, setSearch] = useState("");
  const [permissionToDelete, setPermissionToDelete] = useState<{ id: string; name: string } | null>(null);
  const { data: roleData, isLoading } = useRole(role?.id || null);
  const { mutate: removePermission, isPending: isRemoving } = useRemovePermission();

  const handleRemovePermission = () => {
    if (!role || !permissionToDelete) return;
    removePermission(
      { roleId: role.id, permissionId: permissionToDelete.id },
      {
        onSuccess: () => {
          toast.success("Permission removed successfully");
          setPermissionToDelete(null);
        },
        onError: (err: { message?: string }) => toast.error(err.message || "Failed to remove permission"),
      }
    );
  };

  const permissions = roleData?.permissions || [];
  const filteredPermissions = permissions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md px-4">
        <SheetHeader className="space-y-1">
          <SheetTitle>Role Permissions</SheetTitle>
          <SheetDescription>
            {role ? `Viewing permissions for role: ${role.name}` : "Select a role to view permissions"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[calc(100vh-200px)] pr-4">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPermissions.length > 0 ? (
              <div className="grid gap-4">
                {filteredPermissions.map((p) => (
                  <div key={p.id} className="flex flex-col gap-1 border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] h-5">
                          Permit
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setPermissionToDelete({ id: p.id, name: p.name })}
                          disabled={isRemoving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {p.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {p.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <p className="text-sm text-muted-foreground">
                  {search ? "No matching permissions found" : "No permissions assigned to this role"}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>

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
    </Sheet>
  );
}

export { RolePermissionsDrawer };
