import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationTable } from "./components/location-table";
import { LocationDialog } from "./components/location-dialog";
import { useLocations } from "./api/use-locations";

import { useQueryStates, useQueryState, parseAsInteger } from "nuqs";
import { PermissionGuard } from "../rbac/components/permission-guard";
import { Permissions } from "../rbac/utils/permission-constants";

function LocationsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pagination] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  });
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    throttleMs: 400,
  });

  const { data, isLoading } = useLocations({
    page: pagination.page,
    limit: pagination.limit,
    search: search || undefined,
  });

  const locations = data?.items || [];
  const pageCount = data?.meta.totalPages || 1;

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Storage Locations</h2>
          <p className="text-muted-foreground">Manage physical warehouse zones and bins.</p>
        </div>
        <div className="flex items-center space-x-2">
          <PermissionGuard permission={Permissions.locations.update}>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <LocationTable data={locations} pageCount={pageCount} search={search} onSearchChange={setSearch} />
      )}

      <LocationDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}

export { LocationsPage };
