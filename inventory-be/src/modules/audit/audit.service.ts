import { eq, desc, sql, or, like, and } from "drizzle-orm";
import { db } from "../../db";
import { auditTable } from "./audit.schema";
import { userTable } from "../user/user.schema";
import type { CreateAuditInput, GetAuditsQuery } from "./audit.types";
import { calculateOffset, buildPaginatedResponse } from "../../lib/pagination";

async function getAllAudits(query: GetAuditsQuery) {
  const { page, limit, search } = query;
  const offset = calculateOffset(page, limit);

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(userTable.name, `%${search}%`),
        like(auditTable.action, `%${search}%`),
        like(auditTable.entity, `%${search}%`),
        like(auditTable.details, `%${search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select({
      id: auditTable.id,
      userId: auditTable.userId,
      userName: userTable.name,
      action: auditTable.action,
      entity: auditTable.entity,
      entityId: auditTable.entityId,
      details: auditTable.details,
      createdAt: auditTable.createdAt,
    })
    .from(auditTable)
    .leftJoin(userTable, eq(auditTable.userId, userTable.id))
    .where(whereClause ? whereClause : undefined)
    .orderBy(desc(auditTable.createdAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(auditTable)
    .leftJoin(userTable, eq(auditTable.userId, userTable.id))
    .where(whereClause ? whereClause : undefined);

  const total = countResult[0]?.count ?? 0;
  return buildPaginatedResponse(data, total, page, limit);
}

async function logAudit(data: CreateAuditInput) {
  await db.insert(auditTable).values(data);
}

export { getAllAudits, logAudit };
