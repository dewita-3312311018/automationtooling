import { createStockPayloadSchema } from "./stock.validators";
import { z } from "zod";

type CreateStockInput = z.infer<typeof createStockPayloadSchema>;
type UpdateStockInput = Partial<CreateStockInput>;

interface GetStocksQuery {
  page: number;
  limit: number;
  search?: string;
  type?: "mechanical" | "electrical";
}

export type { CreateStockInput, UpdateStockInput, GetStocksQuery };
