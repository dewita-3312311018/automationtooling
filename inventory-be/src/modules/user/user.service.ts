import { eq, or, like, and, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../../db";
import { userTable } from "./user.schema";
import { userRoleTable, roleTable } from "../rbac/rbac.schema";
import type { CreateUserInput, GetUsersQuery } from "./user.types";
import { calculateOffset, buildPaginatedResponse } from "../../lib/pagination";

async function getAllUsers(query: GetUsersQuery) {
  const { page, limit, search } = query;
  const offset = calculateOffset(page, limit);

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(userTable.name, `%${search}%`),
        like(userTable.username, `%${search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select({
      id: userTable.id,
      username: userTable.username,
      name: userTable.name,
      role: roleTable.name,
      createdAt: userTable.createdAt,
      updatedAt: userTable.updatedAt,
    })
    .from(userTable)
    .leftJoin(userRoleTable, eq(userTable.id, userRoleTable.userId))
    .leftJoin(roleTable, eq(userRoleTable.roleId, roleTable.id))
    .where(whereClause ? whereClause : undefined)
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(userTable)
    .where(whereClause ? whereClause : undefined);

  const total = countResult[0]?.count ?? 0;

  return buildPaginatedResponse(data, total, page, limit);
}

async function getUserById(id: string) {
  const rows = await db
    .select({
      id: userTable.id,
      username: userTable.username,
      name: userTable.name,
      role: roleTable.name,
      createdAt: userTable.createdAt,
      updatedAt: userTable.updatedAt,
    })
    .from(userTable)
    .leftJoin(userRoleTable, eq(userTable.id, userRoleTable.userId))
    .leftJoin(roleTable, eq(userRoleTable.roleId, roleTable.id))
    .where(eq(userTable.id, id));
  return rows[0] ?? null;
}

async function getUserByUsername(username: string) {
  const rows = await db.select().from(userTable).where(eq(userTable.username, username));
  return rows[0] ?? null;
}

async function createUser(data: CreateUserInput) {
  const id = crypto.randomUUID();
  await db.insert(userTable).values({ ...data, id });
  return getUserByUsername(data.username);
}

async function deleteUser(id: string) {
  const user = await getUserById(id);
  if (!user) return null;
  await db.delete(userTable).where(eq(userTable.id, id));
  return user;
}

async function updateUserPassword(username: string, password: string, userId?: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const whereClause = userId ? eq(userTable.id, userId) : eq(userTable.username, username);

  await db
    .update(userTable)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(whereClause);

  const rows = await db
    .select({
      id: userTable.id,
      username: userTable.username,
      name: userTable.name,
    })
    .from(userTable)
    .where(whereClause);
  return rows[0] ?? null;
}

async function updateUserProfile(id: string, data: { name?: string; username?: string }) {
  await db
    .update(userTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(userTable.id, id));

  const rows = await db
    .select({
      id: userTable.id,
      username: userTable.username,
      name: userTable.name,
      createdAt: userTable.createdAt,
      updatedAt: userTable.updatedAt,
    })
    .from(userTable)
    .where(eq(userTable.id, id));
  return rows[0] ?? null;
}

async function getUsersByRoleName(roleName: string) {
  return await db
    .select({
      id: userTable.id,
      username: userTable.username,
      name: userTable.name,
    })
    .from(userTable)
    .innerJoin(userRoleTable, eq(userTable.id, userRoleTable.userId))
    .innerJoin(roleTable, eq(userRoleTable.roleId, roleTable.id))
    .where(eq(roleTable.name, roleName));
}

export { getAllUsers, getUserById, getUserByUsername, createUser, deleteUser, updateUserPassword, updateUserProfile, getUsersByRoleName };

