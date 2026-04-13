import { mysqlTable, varchar, int, timestamp, text, date } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userTable } from "../user/user.schema";
import { stockTable } from "../stock/stock.schema";

const requestTable = mysqlTable("requests", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => userTable.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("procurement"),
  stockId: varchar("stock_id", { length: 36 }).references(() => stockTable.id, { onDelete: "cascade" }), // Nullable
  requestedModelNumber: varchar("requested_model_number", { length: 100 }),
  requestedBrand: varchar("requested_brand", { length: 100 }),
  requestedDescription: text("requested_description"),
  quantity: int("quantity").notNull(),
  urgency: varchar("urgency", { length: 50 }).default("normal"),
  note: text("note"),
  status: varchar("status", { length: 50 }).notNull().default("PENDING"),
  adminNote: text("admin_note"),
  poNumber: varchar("po_number", { length: 100 }),
  eta: date("eta"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

const insertRequestSchema = createInsertSchema(requestTable);
const selectRequestSchema = createSelectSchema(requestTable);

export { requestTable, insertRequestSchema, selectRequestSchema };
