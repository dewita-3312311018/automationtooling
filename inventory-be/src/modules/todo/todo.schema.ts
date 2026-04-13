import { mysqlTable, varchar, boolean, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

const todoTable = mysqlTable("todo", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 500 }).notNull(),
    isDone: boolean("is_done",).notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

const insertTodoSchema = createInsertSchema(todoTable);
const selectTodoSchema = createSelectSchema(todoTable);

export { todoTable, insertTodoSchema, selectTodoSchema };