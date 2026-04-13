import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ok, error } from "../../lib/response";
import {
  getAllRoles,
  createRole,
  createPermission,
  assignPermissionToRole,
  assignRoleToUser,
  getAllPermissions,
  updateRole,
  deleteRole,
  updatePermission,
  deletePermission,
  getRoleWithPermissions,
  removePermissionFromRole,
  getUserPermissionsWithRole,
} from "./rbac.service";
import { insertRoleSchema, insertPermissionSchema } from "./rbac.schema";
import { uuidSchema } from "../../lib/params";
import { z } from "zod";
import {
  getRolesQuerySchema,
  getPermissionsQuerySchema,
  assignPermissionSchema,
  assignRoleSchema,
} from "./rbac.validators";
import type { AppEnv } from "../../types/hono";
import { requirePermission } from "../../middleware/rbac";

const rbacRouter = new Hono<AppEnv>();

rbacRouter.get("/me/permissions", async (c) => {
  const user = c.get("user");
  const result = await getUserPermissionsWithRole(user.id);
  return ok(c, result);
});

rbacRouter.use("/*", requirePermission(["rbac:read", "rbac:create", "rbac:update", "rbac:delete"]));

rbacRouter.get(
  "/roles",
  zValidator("query", getRolesQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const roles = await getAllRoles(query);
    return ok(c, roles);
  }
);

rbacRouter.post(
  "/roles",
  zValidator("json", insertRoleSchema),
  async (c) => {
    const body = c.req.valid("json");
    const role = await createRole(body);
    return ok(c, role, 201);
  }
);

rbacRouter.post(
  "/permissions",
  zValidator("json", insertPermissionSchema),
  async (c) => {
    const body = c.req.valid("json");
    const permission = await createPermission(body);
    return ok(c, permission, 201);
  }
);

rbacRouter.get(
  "/permissions",
  zValidator("query", getPermissionsQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const permissions = await getAllPermissions(query);
    return ok(c, permissions);
  }
);

rbacRouter.get("/roles/:id", zValidator("param", z.object({ id: uuidSchema })), async (c) => {
  const { id } = c.req.valid("param");
  const role = await getRoleWithPermissions(id);
  if (!role) return error(c, "Role not found", 404);
  return ok(c, role);
});

rbacRouter.patch(
  "/roles/:id",
  zValidator("param", z.object({ id: uuidSchema })),
  zValidator("json", insertRoleSchema.partial()),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const role = await updateRole(id, body);
    if (!role) return error(c, "Role not found", 404);
    return ok(c, role);
  }
);

rbacRouter.delete("/roles/:id", zValidator("param", z.object({ id: uuidSchema })), async (c) => {
  const { id } = c.req.valid("param");
  const role = await deleteRole(id);
  if (!role) return error(c, "Role not found", 404);
  return ok(c, role);
});

rbacRouter.patch(
  "/permissions/:id",
  zValidator("param", z.object({ id: uuidSchema })),
  zValidator("json", insertPermissionSchema.partial()),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const permission = await updatePermission(id, body);
    if (!permission) return error(c, "Permission not found", 404);
    return ok(c, permission);
  }
);

rbacRouter.delete("/permissions/:id", zValidator("param", z.object({ id: uuidSchema })), async (c) => {
  const { id } = c.req.valid("param");
  const permission = await deletePermission(id);
  if (!permission) return error(c, "Permission not found", 404);
  return ok(c, permission);
});


rbacRouter.post(
  "/roles/remove-permission",
  zValidator("json", assignPermissionSchema),
  async (c) => {
    const { roleId, permissionId } = c.req.valid("json");
    const result = await removePermissionFromRole(roleId, permissionId);
    return ok(c, result);
  }
);

rbacRouter.post(
  "/roles/assign-permission",
  zValidator("json", assignPermissionSchema),
  async (c) => {
    const { roleId, permissionId } = c.req.valid("json");
    const result = await assignPermissionToRole(roleId, permissionId);
    return ok(c, result, 201);
  }
);

rbacRouter.post(
  "/users/assign-role",
  zValidator("json", assignRoleSchema),
  async (c) => {
    const { userId, roleId } = c.req.valid("json");
    const result = await assignRoleToUser(userId, roleId);
    return ok(c, result, 201);
  }
);

export { rbacRouter };
