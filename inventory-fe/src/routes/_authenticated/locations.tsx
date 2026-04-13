import { createFileRoute, redirect } from "@tanstack/react-router";
import { LocationsPage } from "@/features/location";
import { checkPermission } from "@/features/rbac/utils/auth-check";
import { Permissions } from "@/features/rbac/utils/permission-constants";

export const Route = createFileRoute("/_authenticated/locations")({
  beforeLoad: async () => {
    const hasPermission = await checkPermission(Permissions.locations.read);
    if (!hasPermission) {
      throw redirect({ to: "/forbidden" });
    }
  },
  component: LocationsPage,
});
