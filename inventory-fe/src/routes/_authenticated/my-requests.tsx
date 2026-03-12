import { createFileRoute } from "@tanstack/react-router";
import { MyRequestsPage } from "@/features/request";
import { redirect } from "@tanstack/react-router";
import { checkPermission } from "@/features/rbac/utils/auth-check";
import { Permissions } from "@/features/rbac/utils/permission-constants";

const Route = createFileRoute("/_authenticated/my-requests")({
  component: MyRequestsPage,
  beforeLoad: async () => {
    const hasPermission = await checkPermission(Permissions.requests.myRequests);
    if (!hasPermission) {
      throw redirect({ to: "/forbidden" });
    }
  }
});

export { Route };
