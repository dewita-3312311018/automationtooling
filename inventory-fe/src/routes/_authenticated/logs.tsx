import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuditPage } from "@/features/audit";
import { checkPermission } from "@/features/rbac/utils/auth-check";
import { Permissions } from "@/features/rbac/utils/permission-constants";

const Route = createFileRoute("/_authenticated/logs")({
  beforeLoad: async () => {
    const hasPermission = await checkPermission(Permissions.audit.read);
    if (!hasPermission) {
      throw redirect({ to: "/forbidden" });
    }
  },
  component: AuditPage,
});

export { Route };
