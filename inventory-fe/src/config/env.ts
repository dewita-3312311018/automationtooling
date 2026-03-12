import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.url("VITE_API_URL must be a valid URL"),
  VITE_PUBLIC_URL: z.url("VITE_PUBLIC_URL must be a valid URL"),
});

type EnvSchema = z.infer<typeof envSchema>;

function validateEnv(): EnvSchema {
  try {
    const parsed = envSchema.parse({
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_PUBLIC_URL: import.meta.env.VITE_PUBLIC_URL,
    });

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError<any>;
      const errors = zodError.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n");
      throw new Error(`Environment validation failed:\n${errors}`);
    }
    throw error;
  }
}

export const env = validateEnv();

declare global {
  interface ImportMetaEnv extends EnvSchema {}
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
