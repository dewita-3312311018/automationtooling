import { createFileRoute, redirect } from '@tanstack/react-router'
import { RBACPage } from "@/features/rbac";
import { checkPermission } from "@/features/rbac/utils/auth-check";
import { Permissions } from "@/features/rbac/utils/permission-constants";

export const Route = createFileRoute('/_authenticated/rbac')({
  beforeLoad: async () => {
    const hasPermission = await checkPermission(Permissions.rbac.read);
    if (!hasPermission) {
      throw redirect({ to: "/forbidden" });
    }
  },
  component: RBACPage,
})
