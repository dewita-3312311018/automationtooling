import type { Context, Next } from "hono";
import { error } from "../lib/response";
import { hasPermission } from "../modules/rbac/rbac.service";
import type { AppEnv } from "../types/hono";

function requirePermission(permissionName: string | string[]) {
  return async function (context: Context<AppEnv>, next: Next) {
    const user = context.get("user");

    if (!user || !user.id) {
      return error(context, "Unauthorized", 401);
    }

    const authorized = await hasPermission(user.id, permissionName);
    if (!authorized) {
      return error(context, "Forbidden. Insufficient permissions", 403);
    }

    await next();
  };
}

export { requirePermission };
