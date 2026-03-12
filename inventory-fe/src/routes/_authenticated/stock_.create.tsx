import { createFileRoute, redirect } from "@tanstack/react-router";
import { StockCreatePage } from "@/features/stock";
import { checkPermission } from "@/features/rbac/utils/auth-check";
import { Permissions } from "@/features/rbac/utils/permission-constants";

export const Route = createFileRoute("/_authenticated/stock_/create")({
  beforeLoad: async () => {
    const hasPermission = await checkPermission(Permissions.stocks.read);
    if (!hasPermission) {
      throw redirect({ to: "/forbidden" });
    }
  },
  component: StockCreatePage,
});

