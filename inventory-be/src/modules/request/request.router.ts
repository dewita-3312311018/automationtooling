import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ok, error } from "../../lib/response";

import {
  getAllRequests,
  getRequestById,
  getRequestsByUserId,
  createRequest,
  reviewRequest
} from "./request.service";
import { getRequestsQuerySchema, createRequestPayloadSchema, reviewRequestSchema } from "./request.validators";
import type { AppEnv } from "../../types/hono";
import { idParamSchema } from "../../lib/params";

const requestRouter = new Hono<AppEnv>();


requestRouter.get("/", zValidator("query", getRequestsQuerySchema), async (c) => {
  const query = c.req.valid("query");
  const requests = await getAllRequests(query);
  return ok(c, requests);
});

requestRouter.get("/my-requests", zValidator("query", getRequestsQuerySchema), async (c) => {
  const user = c.get("user");
  if (!user) return error(c, "Unauthorized", 401);

  const query = c.req.valid("query");
  const requests = await getRequestsByUserId(user.id, query);
  return ok(c, requests);
});

requestRouter.get("/:id", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const request = await getRequestById(id);
  if (!request) return error(c, "Request not found", 404);
  return ok(c, request);
});


requestRouter.post(
  "/",
  zValidator("json", createRequestPayloadSchema),
  async (c) => {
    const user = c.get("user");
    if (!user) return error(c, "Unauthorized", 401);

    const body = c.req.valid("json");
    const request = await createRequest(body, user.id);
    return ok(c, request, 201);
  }
);

requestRouter.put(
  "/:id/review",
  zValidator("param", idParamSchema),
  zValidator("json", reviewRequestSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const request = await reviewRequest(id, body);
    return ok(c, request);
  }
);

export { requestRouter };
