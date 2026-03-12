import { mysqlTable, varchar, timestamp, int, mysqlEnum, text, index } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

const stockTypeEnum = mysqlEnum("type", ["mechanical", "electrical"]);

const stockTable = mysqlTable("stocks", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  modelNumber: varchar("model_number", { length: 100 }).notNull(),
  description: text("description"),
  brand: varchar("brand", { length: 100 }),
  quantity: int("quantity").notNull().default(0),
  uom: varchar("uom", { length: 50 }).notNull(),
  projectType: varchar("project_type", { length: 100 }),
  type: mysqlEnum("type", ["mechanical", "electrical"]),
  minStockLevel: int("min_stock_level").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("model_number_idx").on(table.modelNumber),
]);

const insertStockSchema = createInsertSchema(stockTable);
const selectStockSchema = createSelectSchema(stockTable);

export { stockTable, stockTypeEnum, insertStockSchema, selectStockSchema };
