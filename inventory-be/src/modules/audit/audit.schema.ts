import { mysqlTable, varchar, timestamp, text } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userTable } from "../user/user.schema";

const auditTable = mysqlTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => userTable.id, { onDelete: "set null" }),
  action: varchar("action", { length: 50 }).notNull(),
  entity: varchar("entity", { length: 100 }).notNull(),
  entityId: varchar("entity_id", { length: 36 }).notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const insertAuditSchema = createInsertSchema(auditTable);
const selectAuditSchema = createSelectSchema(auditTable);

export { auditTable, insertAuditSchema, selectAuditSchema };
