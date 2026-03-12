import { createFileRoute, redirect } from "@tanstack/react-router";
import { RequestPage } from "@/features/request";
import { checkPermission } from "@/features/rbac/utils/auth-check";
import { Permissions } from "@/features/rbac/utils/permission-constants";

const Route = createFileRoute("/_authenticated/requests")({
  beforeLoad: async () => {
    const hasPermission = await checkPermission(Permissions.requests.read);
    if (!hasPermission) {
      throw redirect({ to: "/forbidden" });
    }
  },
  component: RequestPage,
});

export { Route };
