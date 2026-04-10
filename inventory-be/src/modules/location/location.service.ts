import { eq, or, like, and, sql, desc } from "drizzle-orm";
import { db } from "../../db";
import { locationTable } from "./location.schema";
import type { CreateLocationInput, GetLocationsQuery } from "./location.types";
import { calculateOffset, buildPaginatedResponse } from "../../lib/pagination";

async function getAllLocations(query: GetLocationsQuery) {
  const { page, limit, search } = query;
  const offset = calculateOffset(page, limit);

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(locationTable.name, `%${search}%`),
        like(locationTable.floor, `%${search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select()
    .from(locationTable)
    .where(whereClause ? whereClause : undefined)
    .orderBy(desc(locationTable.updatedAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(locationTable)
    .where(whereClause ? whereClause : undefined);

  const total = countResult[0]?.count ?? 0;

  return buildPaginatedResponse(data, total, page, limit);
}

async function getLocationById(id: string) {
  const rows = await db.select().from(locationTable).where(eq(locationTable.id, id));
  return rows[0] ?? null;
}

async function createLocation(data: CreateLocationInput) {
  const id = crypto.randomUUID();
  await db.insert(locationTable).values({ ...data, id });
  return getLocationById(id);
}

async function deleteLocation(id: string) {
  const location = await getLocationById(id);
  if (!location) return null;
  await db.delete(locationTable).where(eq(locationTable.id, id));
  return location;
}

async function updateLocation(id: string, data: Partial<CreateLocationInput>) {
  await db
    .update(locationTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(locationTable.id, id));
  return getLocationById(id);
}

export {
  getAllLocations,
  getLocationById,
  createLocation,
  deleteLocation,
  updateLocation,
};
