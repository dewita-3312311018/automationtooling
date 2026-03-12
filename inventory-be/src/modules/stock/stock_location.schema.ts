import { mysqlTable, varchar, int, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { stockTable } from "./stock.schema";
import { locationTable } from "../location/location.schema";

const stockLocationTable = mysqlTable("stock_locations", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  stockId: varchar("stock_id", { length: 36 }).references(() => stockTable.id, { onDelete: "cascade" }).notNull(),
  locationId: varchar("location_id", { length: 36 }).references(() => locationTable.id, { onDelete: "cascade" }).notNull(),
  quantity: int("quantity").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

const insertStockLocationSchema = createInsertSchema(stockLocationTable);
const selectStockLocationSchema = createSelectSchema(stockLocationTable);

export { stockLocationTable, insertStockLocationSchema, selectStockLocationSchema };
