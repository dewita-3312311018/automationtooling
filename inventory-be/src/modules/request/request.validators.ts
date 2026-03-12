import { z } from "zod";
import { insertRequestSchema } from "./request.schema";
import { paginationQuerySchema } from "../../lib/pagination";

export const getRequestsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "ORDERED", "ARRIVED"]).optional(),
  search: z.string().optional(),
});

export const createRequestPayloadSchema = insertRequestSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  adminNote: true,
  poNumber: true,
  eta: true,
  userId: true,
}).refine(data => data.stockId || (data.requestedModelNumber && data.requestedBrand), {
  message: "Either select an existing stock, or provide requested model number and brand."
});

export const reviewRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "ORDERED", "ARRIVED"]),
  adminNote: z.string().optional(),
  poNumber: z.string().optional(),
  eta: z.string().optional(),
  locationId: z.string().optional(),
  existingStockId: z.string().optional(),
  newStockDetails: z.object({
    uom: z.string(),
    type: z.enum(["mechanical", "electrical"]),
    minStockLevel: z.number().min(0).default(0),
    description: z.string().optional(),
    projectType: z.string().optional(),
  }).optional(),
});
