import type { Context } from "hono";

function ok<T>(c: Context, data: T, status: 200 | 201 = 200) {
  return c.json({ success: true, data }, status);
}

function error(c: Context, message: string, status: 400 | 401 | 403 | 404 | 409 | 422 | 500 = 400) {
  return c.json({ success: false, message }, status);
}

export { ok, error };
