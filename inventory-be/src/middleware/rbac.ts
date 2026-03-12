import type { Context, Next } from "hono";
import { error } from "../lib/response";
import { hasPermission } from "../modules/rbac/rbac.service";
import type { AppEnv } from "../types/hono";

function requirePermission(permissionName: string | string[]) {
  return async function (c: Context<AppEnv>, next: Next) {
    const user = c.get("user");

    if (!user || !user.id) {
      return error(c, "Unauthorized", 401);
    }

    const authorized = await hasPermission(user.id, permissionName);
    if (!authorized) {
      return error(c, "Forbidden. Insufficient permissions", 403);
    }

    await next();
  };
}

export { requirePermission };
