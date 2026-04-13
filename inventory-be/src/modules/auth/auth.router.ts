import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ok } from "../../lib/response";
import type { AppEnv } from "../../types/hono";
import { loginUser, registerUser } from "./auth.service";
import { loginSchema, registerSchema } from "./auth.validators";

const authRouter = new Hono<AppEnv>();

authRouter.post(
  "/register",
  zValidator("json", registerSchema),
  async (c) => {
    const body = c.req.valid("json");
    const user = await registerUser(body);
    return ok(c, user, 201);
  }
);

authRouter.post(
  "/login",
  zValidator("json", loginSchema),
  async (c) => {
    const body = c.req.valid("json");
    const result = await loginUser(body);
    return ok(c, result);
  }
);

export { authRouter };
