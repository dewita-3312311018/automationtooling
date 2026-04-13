import { z } from "zod";
import { paginationQuerySchema } from "../../lib/pagination";

export const getAuditsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
});
