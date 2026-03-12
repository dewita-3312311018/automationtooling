import { z } from "zod";

const uuidSchema = z.string().uuid("Invalid ID format");

const idParamSchema = z.object({
  id: uuidSchema,
});

export { idParamSchema, uuidSchema };
