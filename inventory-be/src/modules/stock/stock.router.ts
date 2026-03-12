import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ok, error } from "../../lib/response";
import {
  getAllStocks,
  getStockById,
  getLowStockItems,
  createStock,
  createStocksBulk,
  updateStock,
  updateStockQuantity,
  deleteStock,
  getStockLocations,
  getStockSummary
} from "./stock.service";
import { getStocksQuerySchema, bulkCreateStockPayloadSchema, updateStockQuantitySchema, createStockPayloadSchema } from "./stock.validators";
import { requirePermission } from "../../middleware/rbac";
import type { AppEnv } from "../../types/hono";
import { idParamSchema } from "../../lib/params";

const stockRouter = new Hono<AppEnv>();



stockRouter.get("/", requirePermission("stocks:read"), zValidator("query", getStocksQuerySchema), async (c) => {
  const query = c.req.valid("query");
  const stocks = await getAllStocks({
    page: query.page,
    limit: query.limit,
    search: query.search,
    type: query.type,
  });
  return ok(c, stocks);
});

stockRouter.get("/summary", requirePermission("stocks:read"), async (c) => {
  const summary = await getStockSummary();
  return ok(c, summary);
});

stockRouter.get("/low-stock", requirePermission("stocks:read"), async (c) => {
  const stocks = await getLowStockItems();
  return ok(c, stocks);
});

stockRouter.get("/:id", requirePermission("stocks:read"), zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const stock = await getStockById(id);

  if (!stock) return error(c, "Stock not found", 404);
  return ok(c, stock);
});

stockRouter.get("/:id/locations", requirePermission("stocks:read"), zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const stock = await getStockById(id);
  if (!stock) return error(c, "Stock not found", 404);
  const locations = await getStockLocations(id);
  return ok(c, locations);
});




stockRouter.post(
  "/bulk",
  requirePermission("stocks:create"),
  zValidator("json", bulkCreateStockPayloadSchema),
  async (c) => {
    const user = c.get("user");

    const body = c.req.valid("json");
    if (body.stocks.length === 0) {
      return error(c, "No stock data provided for bulk import", 400);
    }

    const stocks = await createStocksBulk(body.stocks as any, user.id);
    return ok(c, { importedCount: stocks.length }, 201);
  }
);

stockRouter.post(
  "/",
  requirePermission("stocks:create"),
  zValidator("json", createStockPayloadSchema),
  async (c) => {
    const user = c.get("user");

    const body = c.req.valid("json");
    const stock = await createStock(body, user.id);
    return ok(c, stock, 201);
  }
);

stockRouter.put(
  "/:id",
  requirePermission("stocks:update"),
  zValidator("param", idParamSchema),
  zValidator("json", createStockPayloadSchema.partial()),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    const stock = await getStockById(id);
    if (!stock) return error(c, "Stock not found", 404);

    const updated = await updateStock(id, body as any, user.id);
    return ok(c, updated);
  }
);

stockRouter.put(
  "/:id/quantity",
  requirePermission("stocks:update"),
  zValidator("param", idParamSchema),
  zValidator("json", updateStockQuantitySchema),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");

    const { quantity } = c.req.valid("json");

    const stock = await getStockById(id);

    if (!stock) return error(c, "Stock not found", 404);

    const updated = await updateStockQuantity(id, quantity, user.id);

    return ok(c, updated);
  }
);

stockRouter.delete("/:id", requirePermission("stocks:delete"), zValidator("param", idParamSchema), async (c) => {
  const user = c.get("user");

  const { id } = c.req.valid("param");

  const stock = await getStockById(id);

  if (!stock) return error(c, "Stock not found", 404);

  await deleteStock(id, user.id);

  return ok(c, stock);
});

export { stockRouter };
