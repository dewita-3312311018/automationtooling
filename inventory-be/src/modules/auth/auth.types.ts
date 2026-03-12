import { z } from "zod";
import { loginSchema, registerSchema } from "./auth.schema";

type LoginInput = z.infer<typeof loginSchema>;
type RegisterInput = z.infer<typeof registerSchema>;

export type { LoginInput, RegisterInput };
