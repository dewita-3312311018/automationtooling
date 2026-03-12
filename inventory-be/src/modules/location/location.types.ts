import { z } from "zod";
import { insertLocationSchema } from "./location.schema";

type CreateLocationInput = z.infer<typeof insertLocationSchema>;

interface GetLocationsQuery {
  page: number;
  limit: number;
  search?: string;
}

export type { CreateLocationInput, GetLocationsQuery };
