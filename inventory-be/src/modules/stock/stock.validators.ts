import { z } from "zod";
import { insertStockSchema } from "./stock.schema";
import { paginationQuerySchema } from "../../lib/pagination";

export const createStockPayloadSchema = insertStockSchema.extend({
  locations: z.array(z.object({
    locationId: z.string().uuid("Invalid location ID"),
    quantity: z.number().min(0),
  })).min(1, "At least one location is required"),
});

export const getStocksQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  type: z.enum(["mechanical", "electrical"]).optional(),
});

export const bulkCreateStockPayloadSchema = z.object({
  stocks: z.array(createStockPayloadSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  }))
});

export const updateStockQuantitySchema = z.object({ quantity: z.number().min(0) });
