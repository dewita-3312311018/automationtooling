import { z } from "zod";
import { getRequestsQuerySchema, createRequestPayloadSchema } from "./request.validators";

type CreateRequestInput = z.infer<typeof createRequestPayloadSchema>;
type GetRequestsQuery = z.infer<typeof getRequestsQuerySchema>;

interface ReviewRequestInput {
  status: "APPROVED" | "REJECTED" | "ORDERED" | "ARRIVED";
  adminNote?: string;
  poNumber?: string;
  eta?: string;
  locationId?: string;
  existingStockId?: string;
  newStockDetails?: {
    uom: string;
    type: "mechanical" | "electrical";
    minStockLevel?: number;
    description?: string;
    projectType?: string;
  };
}

export type { CreateRequestInput, GetRequestsQuery, ReviewRequestInput };
