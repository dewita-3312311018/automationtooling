import { eq, lte, or, like, and, sql, desc } from "drizzle-orm";
import { db } from "../../db";
import { stockTable } from "./stock.schema";
import type { CreateStockInput, GetStocksQuery } from "./stock.types";
import { logAudit } from "../audit/audit.service";
import { createNotification } from "../notification/notification.service";
import { userRoleTable, roleTable } from "../rbac/rbac.schema";
import { locationTable } from "../location/location.schema";
import { requestTable } from "../request/request.schema";
import { stockLocationTable } from "./stock_location.schema";
import { calculateOffset, buildPaginatedResponse } from "../../lib/pagination";

async function getAllStocks(query: GetStocksQuery) {
  const { page, limit, search, type } = query;
  const offset = calculateOffset(page, limit);

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(stockTable.modelNumber, `%${search}%`),
        like(stockTable.brand, `%${search}%`),
      )
    );
  }

  if (type) {
    conditions.push(eq(stockTable.type, type));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select()
    .from(stockTable)
    .where(whereClause ? whereClause : undefined)
    .orderBy(desc(stockTable.updatedAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(stockTable)
    .where(whereClause ? whereClause : undefined);

  const total = countResult[0]?.count ?? 0;

  return buildPaginatedResponse(data, total, page, limit);
}

async function getStockById(id: string) {
  const rows = await db.select().from(stockTable).where(eq(stockTable.id, id));
  return rows[0] ?? null;
}

async function getStockByLocationId(locationId: string) {
  const rows = await db
    .select({ stock: stockTable })
    .from(stockLocationTable)
    .innerJoin(stockTable, eq(stockLocationTable.stockId, stockTable.id))
    .where(eq(stockLocationTable.locationId, locationId));
  return rows.map((r) => r.stock);
}

async function getLowStockItems() {
  return db.select().from(stockTable).where(lte(stockTable.quantity, stockTable.minStockLevel));
}

async function createStock(data: CreateStockInput, userId: string) {
  const id = crypto.randomUUID();
  const { locations, ...stockData } = data;

  const totalQuantity = locations.reduce((sum, loc) => sum + loc.quantity, 0);

  await db.transaction(async (tx) => {
    await tx.insert(stockTable).values({ ...stockData, id, quantity: totalQuantity });

    const locationInserts = locations.map(loc => ({
      id: crypto.randomUUID(),
      stockId: id,
      locationId: loc.locationId,
      quantity: loc.quantity,
    }));
    await tx.insert(stockLocationTable).values(locationInserts);
  });

  const newStock = await getStockById(id);

  if (newStock) {
    await logAudit({
      userId,
      action: "CREATE",
      entity: "STOCK",
      entityId: newStock.id,
      details: `Created stock item: ${newStock.modelNumber} with quantity ${totalQuantity}`,
    });
  }

  return newStock;
}

async function createStocksBulk(data: CreateStockInput[], userId: string) {
  if (data.length === 0) return [];

  const itemsWithIds: any[] = [];
  const locationInserts: any[] = [];

  for (const item of data) {
    const id = crypto.randomUUID();
    const { locations, ...stockData } = item;
    const totalQuantity = locations.reduce((sum, loc) => sum + loc.quantity, 0);

    itemsWithIds.push({ ...stockData, id, quantity: totalQuantity });

    for (const loc of locations) {
      locationInserts.push({
        id: crypto.randomUUID(),
        stockId: id,
        locationId: loc.locationId,
        quantity: loc.quantity,
      });
    }
  }

  await db.transaction(async (tx) => {
    await tx.insert(stockTable).values(itemsWithIds);
    await tx.insert(stockLocationTable).values(locationInserts);
  });

  await logAudit({
    userId,
    action: "CREATE",
    entity: "STOCK",
    entityId: "BULK",
    details: `Bulk imported ${itemsWithIds.length} stock items`,
  });

  return itemsWithIds;
}

async function updateStock(id: string, data: Partial<CreateStockInput>, userId: string) {
  const stockBefore = await getStockById(id);
  if (!stockBefore) return null;

  const { locations, ...stockData } = data;

  await db.transaction(async (tx) => {
    if (Object.keys(stockData).length > 0) {
      await tx
        .update(stockTable)
        .set({ ...stockData, updatedAt: new Date() })
        .where(eq(stockTable.id, id));
    }

    if (locations) {
      await tx.delete(stockLocationTable).where(eq(stockLocationTable.stockId, id));

      if (locations.length > 0) {
        const locationInserts = locations.map(loc => ({
          id: crypto.randomUUID(),
          stockId: id,
          locationId: loc.locationId,
          quantity: loc.quantity,
        }));
        await tx.insert(stockLocationTable).values(locationInserts);

        const totalQuantity = locations.reduce((sum, loc) => sum + loc.quantity, 0);
        await tx.update(stockTable).set({ quantity: totalQuantity, updatedAt: new Date() }).where(eq(stockTable.id, id));
      }
    }
  });

  const stock = await getStockById(id);

  if (stock) {
    await logAudit({
      userId,
      action: "UPDATE",
      entity: "STOCK",
      entityId: stock.id,
      details: `Updated stock item: ${stock.modelNumber}. Fields: ${Object.keys(data).join(", ")}`,
    });
  }

  return stock;
}

async function updateStockQuantity(id: string, newQuantity: number, userId: string) {
  const stockBefore = await getStockById(id);

  await db
    .update(stockTable)
    .set({ quantity: newQuantity, updatedAt: new Date() })
    .where(eq(stockTable.id, id));

  const stock = await getStockById(id);

  if (stock && stockBefore) {
    await logAudit({
      userId,
      action: "UPDATE",
      entity: "STOCK",
      entityId: stock.id,
      details: `Quantity changed from ${stockBefore.quantity} to ${stock.quantity}`,
    });

    if (stock.quantity <= stock.minStockLevel && stockBefore.quantity > stockBefore.minStockLevel) {
      const admins = await db.select({ userId: userRoleTable.userId })
        .from(userRoleTable)
        .innerJoin(roleTable, eq(roleTable.id, userRoleTable.roleId))
        .where(eq(roleTable.name, "admin"));

      for (const admin of admins) {
        await createNotification({
          userId: admin.userId,
          title: "Low Stock Alert",
          message: `Stock for ${stock.modelNumber} dropped to ${stock.quantity}. Minimum is ${stock.minStockLevel}.`,
        });
      }
    }
  }

  return stock;
}

async function getStockLocations(id: string) {
  const stock = await getStockById(id);
  if (!stock) return [];

  return db
    .select({
      locationId: locationTable.id,
      locationName: locationTable.name,
      floor: locationTable.floor,
      quantity: stockLocationTable.quantity,
    })
    .from(stockLocationTable)
    .innerJoin(locationTable, eq(stockLocationTable.locationId, locationTable.id))
    .where(eq(stockLocationTable.stockId, id));
}

async function deleteStock(id: string, userId: string) {
  const stock = await getStockById(id);
  if (!stock) return null;

  await db.delete(stockTable).where(eq(stockTable.id, id));

  await logAudit({
    userId,
    action: "DELETE",
    entity: "STOCK",
    entityId: stock.id,
    details: `Deleted stock: ${stock.modelNumber}`,
  });

  return stock;
}

async function getStockSummary() {
  const [totalStocks] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(stockTable);

  const [lowStockAlerts] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(stockTable)
    .where(lte(stockTable.quantity, stockTable.minStockLevel));

  const [technicalItems] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(stockTable)
    .where(
      or(
        eq(stockTable.type, "mechanical"),
        eq(stockTable.type, "electrical")
      )
    );

  const [pendingRequests] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(requestTable)
    .where(eq(requestTable.status, "PENDING"));

  return {
    totalStocks: totalStocks?.count ?? 0,
    lowStockAlerts: lowStockAlerts?.count ?? 0,
    technicalItems: technicalItems?.count ?? 0,
    pendingRequests: pendingRequests?.count ?? 0,
  };
}

export {
  getAllStocks,
  getStockById,
  getStockByLocationId,
  getLowStockItems,
  createStock,
  createStocksBulk,
  updateStock,
  updateStockQuantity,
  deleteStock,
  getStockLocations,
  getStockSummary,
};
