import { eq, desc, sql } from "drizzle-orm";
import { db } from "../../db";
import { notificationTable } from "./notification.schema";
import type { CreateNotificationInput, GetNotificationsQuery } from "./notification.types";
import { AppError } from "../../lib/error";
import { calculateOffset, buildPaginatedResponse } from "../../lib/pagination";

async function getMyNotifications(userId: string, query: GetNotificationsQuery) {
  const { page, limit } = query;
  const offset = calculateOffset(page, limit);

  const data = await db
    .select()
    .from(notificationTable)
    .where(eq(notificationTable.userId, userId))
    .orderBy(desc(notificationTable.createdAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(notificationTable)
    .where(eq(notificationTable.userId, userId));

  const total = countResult[0]?.count ?? 0;
  return buildPaginatedResponse(data, total, page, limit);
}

async function createNotification(data: CreateNotificationInput) {
  const id = crypto.randomUUID();
  await db.insert(notificationTable).values({ ...data, id });
}

async function markAsRead(id: string, userId: string) {
  const rows = await db
    .select()
    .from(notificationTable)
    .where(eq(notificationTable.id, id));

  const notification = rows[0];
  if (!notification) throw new AppError("Notification not found", 404);
  if (notification.userId !== userId) throw new AppError("Forbidden", 403);

  await db
    .update(notificationTable)
    .set({ isRead: true })
    .where(eq(notificationTable.id, id));

  return { ...notification, isRead: true };
}

async function markAllAsRead(userId: string) {
  await db
    .update(notificationTable)
    .set({ isRead: true })
    .where(eq(notificationTable.userId, userId));
  return { success: true };
}

export {
  getMyNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
};
