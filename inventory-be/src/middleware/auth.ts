import { verify } from "hono/jwt";
import type { Context, Next } from "hono";
import { env } from "../env";
import { error } from "../lib/response";

async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return error(c, "Missing or invalid authorization header", 401);
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return error(c, "Missing token", 401);
  }

  try {
    const payload = await verify(token, env.JWT_SECRET as string, "HS256");
    c.set("user", { id: payload.sub });
    await next();
  } catch {
    return error(c, "Invalid token", 401);
  }
}

export { authMiddleware };
