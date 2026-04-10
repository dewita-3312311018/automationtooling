import { eq, and, or, like, sql, asc } from "drizzle-orm";
import { db } from "../../db";
import {
  roleTable,
  permissionTable,
  rolePermissionTable,
  userRoleTable,
} from "./rbac.schema";
import type {
  CreateRoleInput,
  CreatePermissionInput,
  GetRolesQuery,
  GetPermissionsQuery,
} from "./rbac.types";
import { calculateOffset, buildPaginatedResponse } from "../../lib/pagination";
import { AppError } from "../../lib/error";

async function getAllRoles(query: GetRolesQuery) {
  const { page, limit, search } = query;
  const offset = calculateOffset(page, limit);

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        like(roleTable.name, `%${search}%`),
        like(roleTable.description, `%${search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select()
    .from(roleTable)
    .where(whereClause ? whereClause : undefined)
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(roleTable)
    .where(whereClause ? whereClause : undefined);

  const total = countResult[0]?.count ?? 0;
  return buildPaginatedResponse(data, total, page, limit);
}

async function getAllPermissions(query: GetPermissionsQuery) {
  const { page, limit, search } = query;
  const offset = calculateOffset(page, limit);

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        like(permissionTable.name, `%${search}%`),
        like(permissionTable.description, `%${search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select()
    .from(permissionTable)
    .where(whereClause ? whereClause : undefined)
    .orderBy(asc(permissionTable.name))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(permissionTable)
    .where(whereClause ? whereClause : undefined);

  const total = countResult[0]?.count ?? 0;
  return buildPaginatedResponse(data, total, page, limit);
}

async function createRole(data: CreateRoleInput) {
  try {
    const id = crypto.randomUUID();
    await db.insert(roleTable).values({ ...data, id });
    const rows = await db.select().from(roleTable).where(eq(roleTable.id, id));
    return rows[0];
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
      throw new AppError("Role name already exists", 409);
    }
    throw err;
  }
}

async function createPermission(data: CreatePermissionInput) {
  try {
    const id = crypto.randomUUID();
    await db.insert(permissionTable).values({ ...data, id });
    const rows = await db.select().from(permissionTable).where(eq(permissionTable.id, id));
    return rows[0];
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
      throw new AppError("Permission name already exists", 409);
    }
    throw err;
  }
}

async function updateRole(id: string, data: Partial<CreateRoleInput>) {
  try {
    await db
      .update(roleTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(roleTable.id, id));
    const rows = await db.select().from(roleTable).where(eq(roleTable.id, id));
    return rows[0] ?? null;
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
      throw new AppError("Role name already exists", 409);
    }
    throw err;
  }
}

async function deleteRole(id: string) {
  const rows = await db.select().from(roleTable).where(eq(roleTable.id, id));
  const role = rows[0] ?? null;
  if (!role) return null;
  await db.delete(roleTable).where(eq(roleTable.id, id));
  return role;
}

async function updatePermission(id: string, data: Partial<CreatePermissionInput>) {
  try {
    await db
      .update(permissionTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(permissionTable.id, id));
    const rows = await db.select().from(permissionTable).where(eq(permissionTable.id, id));
    return rows[0] ?? null;
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
      throw new AppError("Permission name already exists", 409);
    }
    throw err;
  }
}

async function deletePermission(id: string) {
  const rows = await db.select().from(permissionTable).where(eq(permissionTable.id, id));
  const permission = rows[0] ?? null;
  if (!permission) return null;
  await db.delete(permissionTable).where(eq(permissionTable.id, id));
  return permission;
}

async function getRoleWithPermissions(roleId: string) {
  const role = await db.select().from(roleTable).where(eq(roleTable.id, roleId));
  if (role.length === 0) return null;

  const permissions = await db
    .select({
      id: permissionTable.id,
      name: permissionTable.name,
      description: permissionTable.description,
    })
    .from(rolePermissionTable)
    .innerJoin(
      permissionTable,
      eq(rolePermissionTable.permissionId, permissionTable.id)
    )
    .where(eq(rolePermissionTable.roleId, roleId));

  return {
    ...role[0],
    permissions,
  };
}

async function removePermissionFromRole(roleId: string, permissionId: string) {
  const rows = await db
    .select()
    .from(rolePermissionTable)
    .where(
      and(
        eq(rolePermissionTable.roleId, roleId),
        eq(rolePermissionTable.permissionId, permissionId)
      )
    );
  const pivot = rows[0] ?? null;
  if (!pivot) return null;
  await db
    .delete(rolePermissionTable)
    .where(
      and(
        eq(rolePermissionTable.roleId, roleId),
        eq(rolePermissionTable.permissionId, permissionId)
      )
    );
  return pivot;
}

async function assignPermissionToRole(roleId: string, permissionId: string) {
  const id = crypto.randomUUID();
  await db.insert(rolePermissionTable).values({ id, roleId, permissionId });
  const rows = await db.select().from(rolePermissionTable).where(eq(rolePermissionTable.id, id));
  return rows[0];
}

async function assignRoleToUser(userId: string, roleId: string) {
  const id = crypto.randomUUID();
  await db.insert(userRoleTable).values({ id, userId, roleId });
  const rows = await db.select().from(userRoleTable).where(eq(userRoleTable.id, id));
  return rows[0];
}

async function getUserPermissionsWithRole(userId: string) {
  const userRoles = await db
    .select({
      name: roleTable.name,
    })
    .from(userRoleTable)
    .innerJoin(roleTable, eq(userRoleTable.roleId, roleTable.id))
    .where(eq(userRoleTable.userId, userId));

  const role = userRoles[0]?.name || null;

  const rows = await db
    .select({
      permission: permissionTable.name,
    })
    .from(userRoleTable)
    .innerJoin(roleTable, eq(userRoleTable.roleId, roleTable.id))
    .innerJoin(
      rolePermissionTable,
      eq(roleTable.id, rolePermissionTable.roleId)
    )
    .innerJoin(
      permissionTable,
      eq(rolePermissionTable.permissionId, permissionTable.id)
    )
    .where(eq(userRoleTable.userId, userId));

  return {
    role,
    permissions: rows.map((r) => r.permission),
  };
}

async function hasPermission(userId: string, permissionName: string | string[]) {
  const { permissions } = await getUserPermissionsWithRole(userId);

  if (Array.isArray(permissionName)) {
    return permissionName.every((name) => permissions.includes(name));
  }

  return permissions.includes(permissionName);
}

export {
  getAllRoles,
  createRole,
  getAllPermissions,
  createPermission,
  assignPermissionToRole,
  assignRoleToUser,
  getUserPermissionsWithRole,
  hasPermission,
  updateRole,
  deleteRole,
  updatePermission,
  deletePermission,
  getRoleWithPermissions,
  removePermissionFromRole,
};
