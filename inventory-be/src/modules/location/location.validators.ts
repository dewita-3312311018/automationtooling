import { z } from "zod";
import { paginationQuerySchema } from "../../lib/pagination";

export const getLocationsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
});
