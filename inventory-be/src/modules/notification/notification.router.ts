import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ok, error } from "../../lib/response";
import { idParamSchema } from "../../lib/params";
import { z } from "zod";
import type { AppEnv } from "../../types/hono";
import { getMyNotifications, markAllAsRead, markAsRead } from "./notification.service";

const notificationRouter = new Hono<AppEnv>();

notificationRouter.get(
  "/",
  zValidator(
    "query",
    z.object({
      page: z.string().optional().transform((v: string | undefined) => (v ? parseInt(v) : 1)),
      limit: z.string().optional().transform((v: string | undefined) => (v ? parseInt(v) : 10)),
    })
  ),
  async (c) => {
    const user = c.get("user");
    if (!user) return error(c, "Unauthorized", 401);

    const query = c.req.valid("query");
    const notifications = await getMyNotifications(user.id, query);
    return ok(c, notifications);
  }
);

notificationRouter.put("/:id/read", zValidator("param", idParamSchema), async (c) => {
  const user = c.get("user");
  if (!user) return error(c, "Unauthorized", 401);

  const { id } = c.req.valid("param");
  const notification = await markAsRead(id, user.id);
  return ok(c, notification);
});

notificationRouter.put("/read-all", async (c) => {
  const user = c.get("user");
  if (!user) return error(c, "Unauthorized", 401);

  const result = await markAllAsRead(user.id);
  return ok(c, result);
});

export { notificationRouter };
