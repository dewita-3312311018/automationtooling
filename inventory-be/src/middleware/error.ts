import type { Context } from "hono";
import { AppError } from "../lib/error";

function errorHandler(err: Error, c: Context) {
  if (err instanceof AppError) {
    return c.json({ success: false, message: err.message }, err.statusCode as any);
  }
  
  console.error(err);
  return c.json({ success: false, message: "Internal Server Error" }, 500);
}

function notFoundHandler(c: Context) {
  return c.json({ success: false, message: "Route not found" }, 404);
}

export { errorHandler, notFoundHandler };
