import { z } from "zod";
import { paginationQuerySchema } from "../../lib/pagination";

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  username: z.string().min(3).optional(),
});

export const changePasswordSchema = z.object({
  password: z.string().min(6),
});

export const adminChangePasswordSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
});

export const getUsersQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
});
