import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

const locationTable = mysqlTable("locations", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }),
  floor: varchar("floor", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

const insertLocationSchema = createInsertSchema(locationTable);
const selectLocationSchema = createSelectSchema(locationTable);

export { locationTable, insertLocationSchema, selectLocationSchema };
