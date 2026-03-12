import { mysqlTable, varchar, timestamp, text, boolean } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userTable } from "../user/user.schema";

const notificationTable = mysqlTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => userTable.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const insertNotificationSchema = createInsertSchema(notificationTable);
const selectNotificationSchema = createSelectSchema(notificationTable);

export { notificationTable, insertNotificationSchema, selectNotificationSchema };
