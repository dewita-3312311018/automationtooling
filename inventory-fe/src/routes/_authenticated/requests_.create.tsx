import { createFileRoute, redirect } from "@tanstack/react-router";
import { CreateRequestPage } from "@/features/request";
import { checkPermission } from "@/features/rbac/utils/auth-check";
import { Permissions } from "@/features/rbac/utils/permission-constants";

export const Route = createFileRoute("/_authenticated/requests_/create")({
  beforeLoad: async () => {
    const hasPermission = await checkPermission(Permissions.requests.read);
    if (!hasPermission) {
      throw redirect({ to: "/forbidden" });
    }
  },
  component: CreateRequestPage,
});
