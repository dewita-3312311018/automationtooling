import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userTable } from "../user/user.schema";

const roleTable = mysqlTable("roles", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

const permissionTable = mysqlTable("permissions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

const rolePermissionTable = mysqlTable("role_permissions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  roleId: varchar("role_id", { length: 36 }).references(() => roleTable.id, { onDelete: "cascade" }).notNull(),
  permissionId: varchar("permission_id", { length: 36 }).references(() => permissionTable.id, { onDelete: "cascade" }).notNull(),
});

const userRoleTable = mysqlTable("user_roles", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => userTable.id, { onDelete: "cascade" }).notNull(),
  roleId: varchar("role_id", { length: 36 }).references(() => roleTable.id, { onDelete: "cascade" }).notNull(),
});

const insertRoleSchema = createInsertSchema(roleTable);
const selectRoleSchema = createSelectSchema(roleTable);

const insertPermissionSchema = createInsertSchema(permissionTable);
const selectPermissionSchema = createSelectSchema(permissionTable);

const insertRolePermissionSchema = createInsertSchema(rolePermissionTable);
const insertUserRoleSchema = createInsertSchema(userRoleTable);

export {
  roleTable,
  permissionTable,
  rolePermissionTable,
  userRoleTable,
  insertRoleSchema,
  selectRoleSchema,
  insertPermissionSchema,
  selectPermissionSchema,
  insertRolePermissionSchema,
  insertUserRoleSchema,
};
