import { useState } from "react";
import { Search, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { usePermissions } from "../api/use-permissions";
import { useAssignPermission } from "../api/use-assign-permission";
import { useRemovePermission } from "../api/use-remove-permission";
import type { RoleInfo } from "@/features/staff/types";

interface RolePermissionsDialogProps {
  role: RoleInfo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignedPermissionIds: string[];
}

function RolePermissionsDialog({ role, open, onOpenChange, assignedPermissionIds }: RolePermissionsDialogProps) {
  const [search, setSearch] = useState("");
  const { data: permissionsData, isLoading } = usePermissions({
    search: search || undefined,
    limit: 100, // Show more in dialog
  });
  const allPermissions = permissionsData?.items || [];
  const { mutateAsync: assignPermission } = useAssignPermission();
  const { mutateAsync: removePermission } = useRemovePermission();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>(assignedPermissionIds);

  const filteredPermissions = allPermissions;

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const toAdd = selectedIds.filter(id => !assignedPermissionIds.includes(id));
      const toRemove = assignedPermissionIds.filter(id => !selectedIds.includes(id));

      await Promise.all([
        ...toAdd.map(id => assignPermission({ roleId: role.id, permissionId: id })),
        ...toRemove.map(id => removePermission({ roleId: role.id, permissionId: id }))
      ]);

      toast.success("Permissions updated successfully");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update permissions");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Permissions</DialogTitle>
          <DialogDescription>
            Select permissions to assign to the <strong>{role.name}</strong> role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[300px] pr-4 border rounded-md p-2">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPermissions.length > 0 ? (
              <div className="space-y-4">
                {filteredPermissions.map((p) => (
                  <div key={p.id} className="flex items-start space-x-3 space-y-0">
                    <Checkbox
                      id={p.id}
                      checked={selectedIds.includes(p.id)}
                      onCheckedChange={() => handleToggle(p.id)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={p.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {p.name}
                      </label>
                      {p.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <p className="text-sm text-muted-foreground">No permissions found</p>
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { RolePermissionsDialog };
