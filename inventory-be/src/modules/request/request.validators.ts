import { z } from "zod";
import { insertRequestSchema } from "./request.schema";
import { paginationQuerySchema } from "../../lib/pagination";

export const getRequestsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "ORDERED", "ARRIVED"]).optional(),
  type: z.enum(["procurement", "withdrawal"]).optional(),
  search: z.string().optional(),
});

const optionalEtaString = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "ETA must be a date (YYYY-MM-DD)").optional(),
);

export const createRequestPayloadSchema = insertRequestSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    status: true,
    adminNote: true,
    poNumber: true,
    eta: true,
    userId: true,
    type: true,
  })
  .extend({
    type: z.enum(["procurement", "withdrawal"]).default("procurement"),
    eta: optionalEtaString,
  })
  .refine((data) => {
    if (data.type === "withdrawal") {
      return !!data.stockId;
    }
    return data.stockId || (data.requestedModelNumber && data.requestedBrand);
  }, {
    message: "Withdrawal requires an existing stock item. Procurement requires either an existing stock or requested model number and brand.",
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
