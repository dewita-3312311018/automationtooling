import { z } from "zod";
import { insertRoleSchema, insertPermissionSchema } from "./rbac.schema";

type CreateRoleInput = z.infer<typeof insertRoleSchema>;
type CreatePermissionInput = z.infer<typeof insertPermissionSchema>;

interface GetRolesQuery {
  page: number;
  limit: number;
  search?: string;
}

interface GetPermissionsQuery {
  page: number;
  limit: number;
  search?: string;
}

export type { CreateRoleInput, CreatePermissionInput, GetRolesQuery, GetPermissionsQuery };
