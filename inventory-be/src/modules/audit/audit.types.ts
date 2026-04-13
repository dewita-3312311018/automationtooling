import { z } from "zod";
import { insertAuditSchema } from "./audit.schema";

type CreateAuditInput = z.infer<typeof insertAuditSchema>;

interface GetAuditsQuery {
  page: number;
  limit: number;
  search?: string;
}

export type { CreateAuditInput, GetAuditsQuery };
