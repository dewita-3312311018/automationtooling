import { z } from "zod";
import { insertUserSchema } from "./user.schema";

type CreateUserInput = z.infer<typeof insertUserSchema>;

interface GetUsersQuery {
  page: number;
  limit: number;
  search?: string;
}

export type { CreateUserInput, GetUsersQuery };
