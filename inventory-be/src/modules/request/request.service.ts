import { db } from "../../db";
import { requestTable } from "./request.schema";
import { stockTable } from "../stock/stock.schema";
import { userTable } from "../user/user.schema";
import type { CreateRequestInput, ReviewRequestInput, GetRequestsQuery } from "./request.types";
import { AppError } from "../../lib/error";
import { logAudit } from "../audit/audit.service";
import { createNotification } from "../notification/notification.service";
import { calculateOffset, buildPaginatedResponse } from "../../lib/pagination";
import { eq, and, sql, or, like, desc } from "drizzle-orm";
import { getLocationById } from "../location/location.service";
import { stockLocationTable } from "../stock/stock_location.schema";

const resolvedModelNumber = sql<string | null>`COALESCE(${stockTable.modelNumber}, ${requestTable.requestedModelNumber})`;

const requestSelectShape = {
  id: requestTable.id,
  userId: requestTable.userId,
  stockId: requestTable.stockId,
  modelNumber: resolvedModelNumber,
  requestedModelNumber: requestTable.requestedModelNumber,
  requestedBrand: requestTable.requestedBrand,
  requestedDescription: requestTable.requestedDescription,
  quantity: requestTable.quantity,
  urgency: requestTable.urgency,
  note: requestTable.note,
  status: requestTable.status,
  adminNote: requestTable.adminNote,
  poNumber: requestTable.poNumber,
  eta: requestTable.eta,
  createdAt: requestTable.createdAt,
  updatedAt: requestTable.updatedAt,
  requester: {
    name: userTable.name,
  },
};

async function getAllRequests(query: GetRequestsQuery) {
  const { page, limit, status, search } = query;
  const offset = calculateOffset(page, limit);

  const conditions = [];
  if (status) conditions.push(eq(requestTable.status, status));
  if (search) {
    conditions.push(
      or(
        like(requestTable.adminNote, `%${search}%`),
        like(requestTable.poNumber, `%${search}%`),
        like(stockTable.modelNumber, `%${search}%`),
        like(requestTable.requestedModelNumber, `%${search}%`),
        like(requestTable.requestedBrand, `%${search}%`),
        like(userTable.name, `%${search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select(requestSelectShape)
    .from(requestTable)
    .leftJoin(stockTable, eq(requestTable.stockId, stockTable.id))
    .innerJoin(userTable, eq(requestTable.userId, userTable.id))
    .where(whereClause ? whereClause : undefined)
    .orderBy(
      desc(requestTable.updatedAt),
    )
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(requestTable)
    .leftJoin(stockTable, eq(requestTable.stockId, stockTable.id))
    .innerJoin(userTable, eq(requestTable.userId, userTable.id))
    .where(whereClause ? whereClause : undefined);

  const total = countResult[0]?.count ?? 0;
  return buildPaginatedResponse(data, total, page, limit);
}

async function getRequestById(id: string) {
  const rows = await db
    .select(requestSelectShape)
    .from(requestTable)
    .leftJoin(stockTable, eq(requestTable.stockId, stockTable.id))
    .innerJoin(userTable, eq(requestTable.userId, userTable.id))
    .where(eq(requestTable.id, id));
  return rows[0] ?? null;
}

async function getRequestsByUserId(userId: string, query: GetRequestsQuery) {
  const { page, limit, status, search } = query;
  const offset = calculateOffset(page, limit);

  const conditions = [];
  conditions.push(eq(requestTable.userId, userId));

  if (status) conditions.push(eq(requestTable.status, status));
  if (search) {
    conditions.push(
      or(
        like(requestTable.adminNote, `%${search}%`),
        like(requestTable.poNumber, `%${search}%`),
        like(stockTable.modelNumber, `%${search}%`),
        like(requestTable.requestedModelNumber, `%${search}%`),
        like(requestTable.requestedBrand, `%${search}%`),
        like(userTable.name, `%${search}%`)
      )
    );
  }

  const whereClause = and(...conditions);

  const data = await db
    .select(requestSelectShape)
    .from(requestTable)
    .leftJoin(stockTable, eq(requestTable.stockId, stockTable.id))
    .innerJoin(userTable, eq(requestTable.userId, userTable.id))
    .where(whereClause)
    .orderBy(
      desc(requestTable.updatedAt),
    )
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(requestTable)
    .leftJoin(stockTable, eq(requestTable.stockId, stockTable.id))
    .innerJoin(userTable, eq(requestTable.userId, userTable.id))
    .where(whereClause);

  const total = countResult[0]?.count ?? 0;
  return buildPaginatedResponse(data, total, page, limit);
}

async function createRequest(data: CreateRequestInput, userId: string) {
  const id = crypto.randomUUID();
  const { eta, ...rest } = data;
  await db.insert(requestTable).values({
    ...rest,
    id,
    userId,
    eta: eta ? new Date(eta as string) : null,
  });
  const request = await getRequestById(id);

  if (request) {
    await logAudit({
      userId: request.userId,
      action: "CREATE",
      entity: "REQUEST",
      entityId: request.id,
      details: `Created request for stock ID ${request.stockId} with urgency ${request.urgency}`,
    });

    // Notify to all users with admin role
    const { getUsersByRoleName } = await import("../user/user.service");
    const admins = await getUsersByRoleName("admin");

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: "New Stock Request",
        message: `${request.requester.name} has created a new request for ${request.modelNumber || request.requestedModelNumber} (Quantity: ${request.quantity}).`,
      });
    }
  }

  return request;
}

async function reviewRequest(id: string, data: ReviewRequestInput) {
  const request = await getRequestById(id);
  if (!request) {
    throw new AppError("Request not found", 404);
  }

  if (data.status === "REJECTED" && !data.adminNote) {
    throw new AppError("Rejection requires an admin note/reason", 400);
  }

  if (data.status === "ARRIVED") {
    let targetStockId = request.stockId;
    if (!targetStockId && data.existingStockId) {
      targetStockId = data.existingStockId;
    }

    if (!targetStockId && data.newStockDetails) {
      if (!request.requestedModelNumber) throw new AppError("Cannot create stock without a requested model number.", 400);
      const newId = crypto.randomUUID();
      await db.insert(stockTable).values({
        id: newId,
        modelNumber: request.requestedModelNumber,
        brand: request.requestedBrand,
        description: request.requestedDescription,
        quantity: 0,
        uom: data.newStockDetails.uom,
        type: data.newStockDetails.type,
        minStockLevel: data.newStockDetails.minStockLevel || 0,
        projectType: data.newStockDetails.projectType,
      });
      targetStockId = newId;
    }

    if (!targetStockId) throw new AppError("No stock associated with this request. Must provide existingStockId or newStockDetails.", 400);
    if (!data.locationId) throw new AppError("Must specify a location when marking as ARRIVED", 400);

    const stockRows = await db.select().from(stockTable).where(eq(stockTable.id, targetStockId));
    const stock = stockRows[0];
    if (!stock) throw new AppError("Associated stock not found", 404);

    await db.transaction(async (tx) => {
      const newQuantity = stock.quantity + request.quantity;
      await tx.update(stockTable).set({ quantity: newQuantity, updatedAt: new Date() }).where(eq(stockTable.id, targetStockId));

      const locRows = await tx.select().from(stockLocationTable).where(and(eq(stockLocationTable.stockId, targetStockId), eq(stockLocationTable.locationId, data.locationId!)));

      const locRow = locRows[0];
      if (locRow) {
        await tx.update(stockLocationTable).set({ quantity: locRow.quantity + request.quantity, updatedAt: new Date() })
          .where(eq(stockLocationTable.id, locRow.id));
      } else {
        await tx.insert(stockLocationTable).values({
          id: crypto.randomUUID(),
          stockId: targetStockId,
          locationId: data.locationId!,
          quantity: request.quantity
        });
      }

      if (request.stockId !== targetStockId) {
        await tx.update(requestTable).set({ stockId: targetStockId }).where(eq(requestTable.id, id));
      }
    });

    let locationName = "";
    if (data.locationId) {
      const location = await getLocationById(data.locationId);
      locationName = location?.name ?? "";
    }

    await logAudit({
      action: "UPDATE",
      entity: "STOCK",
      entityId: targetStockId,
      details: `Stock incremented by ${request.quantity} (Total: ${stock.quantity + request.quantity}) due to request arrival. Location: ${locationName}`,
    });
  }

  await db
    .update(requestTable)
    .set({
      status: data.status,
      adminNote: data.adminNote ?? request.adminNote,
      poNumber: data.poNumber ?? request.poNumber,
      eta: (() => { const v = data.eta ?? request.eta; return v ? new Date(v) : null; })(),
      updatedAt: new Date(),
    })
    .where(eq(requestTable.id, id));

  const updatedRequest = await getRequestById(id);

  if (updatedRequest && updatedRequest.status !== request.status) {
    await logAudit({
      action: "UPDATE",
      entity: "REQUEST",
      entityId: updatedRequest.id,
      details: `Request status changed from ${request.status} to ${updatedRequest.status}`,
    });

    await createNotification({
      userId: updatedRequest.userId,
      title: `Request ${updatedRequest.status}`,
      message: `Your request was marked as ${updatedRequest.status}. ${data.adminNote ? `Note: ${data.adminNote}` : ""}`,
    });
  }

  return updatedRequest;
}

export {
  getAllRequests,
  getRequestById,
  getRequestsByUserId,
  createRequest,
  reviewRequest,
};
