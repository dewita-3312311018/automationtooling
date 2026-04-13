import { z } from "zod";
import { uuidSchema } from "../../lib/params";
import { paginationQuerySchema } from "../../lib/pagination";

export const getRolesQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
});

export const getPermissionsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
});

export const assignPermissionSchema = z.object({
  roleId: uuidSchema,
  permissionId: uuidSchema,
});

export const assignRoleSchema = z.object({
  userId: uuidSchema,
  roleId: uuidSchema,
});
