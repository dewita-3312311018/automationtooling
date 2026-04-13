import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { ok, error } from "../../lib/response";
import {
  getAllLocations,
  getLocationById,
  createLocation,
  deleteLocation,
  updateLocation
} from "./location.service";
import { getStockByLocationId } from "../stock/stock.service";
import { insertLocationSchema } from "./location.schema";
import { idParamSchema } from "../../lib/params";
import type { AppEnv } from "../../types/hono";
import { requirePermission } from "../../middleware/rbac";
import { getLocationsQuerySchema } from "./location.validators";

const locationRouter = new Hono<AppEnv>();

locationRouter.get(
  "/",
  requirePermission("locations:read"),
  zValidator("query", getLocationsQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const locations = await getAllLocations(query);
    return ok(c, locations);
  }
);

locationRouter.get("/:id", requirePermission("locations:read"), zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const location = await getLocationById(id);
  if (!location) return error(c, "Location not found", 404);
  return ok(c, location);
});

locationRouter.post(
  "/",
  requirePermission("locations:create"),
  zValidator("json", insertLocationSchema),
  async (c) => {
    const body = c.req.valid("json");
    const location = await createLocation(body);
    return ok(c, location, 201);
  }
);

locationRouter.delete("/:id", requirePermission("locations:delete"), zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const location = await deleteLocation(id);
  if (!location) return error(c, "Location not found", 404);
  return ok(c, location);
});

locationRouter.patch(
  "/:id",
  requirePermission("locations:update"),
  zValidator("param", idParamSchema),
  zValidator("json", insertLocationSchema.partial()),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const location = await updateLocation(id, body);
    if (!location) return error(c, "Location not found", 404);
    return ok(c, location);
  }
);

locationRouter.get("/:id/stocks", requirePermission("locations:read"), zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const location = await getLocationById(id);
  if (!location) return error(c, "Location not found", 404);

  const stocks = await getStockByLocationId(id);
  return ok(c, {
    location,
    stocks
  });
});


const publicLocationRouter = new Hono();
publicLocationRouter.get("/:id/stocks", zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const location = await getLocationById(id);
  if (!location) return error(c, "Location not found", 404);

  const stocks = await getStockByLocationId(id);
  return ok(c, {
    location,
    stocks
  });
});

export { locationRouter, publicLocationRouter };
