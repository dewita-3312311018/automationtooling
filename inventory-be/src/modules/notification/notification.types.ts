import { z } from "zod";
import { insertNotificationSchema } from "./notification.schema";

type CreateNotificationInput = z.infer<typeof insertNotificationSchema>;

interface GetNotificationsQuery {
  page: number;
  limit: number;
}

export type { CreateNotificationInput, GetNotificationsQuery };
