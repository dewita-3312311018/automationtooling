import { createFileRoute, redirect } from "@tanstack/react-router";
import { StaffPage } from "@/features/staff";
import { checkPermission } from "@/features/rbac/utils/auth-check";
import { Permissions } from "@/features/rbac/utils/permission-constants";

const Route = createFileRoute("/_authenticated/staff")({
  beforeLoad: async () => {
    const hasPermission = await checkPermission(Permissions.users.read);
    if (!hasPermission) {
      throw redirect({ to: "/forbidden" });
    }
  },
  component: StaffPage,
});

export { Route };
