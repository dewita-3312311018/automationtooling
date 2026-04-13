import { z } from "zod";

const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  username: z.string(),
  password: z.string().min(6),
});

export { loginSchema, registerSchema };
