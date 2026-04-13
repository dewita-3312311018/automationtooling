import { Hono } from "hono";
import { ok } from "../../lib/response";
import { getAllAudits } from "./audit.service";
import { requirePermission } from "../../middleware/rbac";
import { zValidator } from "@hono/zod-validator";
import type { AppEnv } from "../../types/hono";
import { getAuditsQuerySchema } from "./audit.validators";

const auditRouter = new Hono<AppEnv>();


auditRouter.get(
  "/",
  requirePermission("audit:read"),
  zValidator("query", getAuditsQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const audits = await getAllAudits(query);
    return ok(c, audits);
  }
);

export { auditRouter };
