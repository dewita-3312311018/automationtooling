import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Boxes } from "lucide-react";
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
import { LocationDialog } from "./location-dialog.tsx";
import { LocationItemsDrawer } from "./location-items-drawer";
import { PermissionGuard } from "@/features/rbac/components/permission-guard";
import { Permissions } from "@/features/rbac/utils/permission-constants";
import { useDeleteLocation } from "../api/use-delete-location";
import type { LocationInfo } from "../api/use-locations";

interface LocationRowActionsProps {
  location: LocationInfo;
}

function LocationRowActions({ location }: LocationRowActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showItemsInside, setShowItemsInside] = useState(false);
  const { mutate: deleteLocation, isPending: isDeleting } = useDeleteLocation();

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete location "${location.name}"?`)) {
      deleteLocation(location.id, {
        onSuccess: () => toast.success("Location deleted successfully"),
        onError: (err) => toast.error(err.message || "Failed to delete location"),
      });
    }
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
          <DropdownMenuItem onClick={() => setShowItemsInside(true)}>
            <Boxes className="mr-2 h-4 w-4" />
            Show items inside
          </DropdownMenuItem>
          <PermissionGuard permission={Permissions.locations.update}>
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Location
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Location
            </DropdownMenuItem>
          </PermissionGuard>
        </DropdownMenuContent>

      </DropdownMenu>

      <LocationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        location={location}
      />

      <LocationItemsDrawer
        locationId={showItemsInside ? location.id : null}
        onClose={() => setShowItemsInside(false)}
      />
    </>
  );
}

export { LocationRowActions };
