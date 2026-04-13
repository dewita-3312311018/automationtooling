import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ok, error } from "../../lib/response";
import {
  getAllUsers,
  getUserById,
  getUserByUsername,
  createUser,
  deleteUser,
  updateUserPassword,
  updateUserProfile,
} from "./user.service";
import type { AppEnv } from "../../types/hono";
import { insertUserSchema } from "./user.schema";
import { idParamSchema } from "../../lib/params";
import { requirePermission } from "../../middleware/rbac";
import { authMiddleware } from "../../middleware/auth";
import { getUsersQuerySchema, changePasswordSchema, adminChangePasswordSchema, updateProfileSchema } from "./user.validators";

const userRouter = new Hono<AppEnv>();

userRouter.get("/profile", authMiddleware, async (c) => {
  const payload = c.get("user");
  const user = await getUserById(payload.id);
  if (!user) return error(c, "User not found", 401);
  return ok(c, user);
});

userRouter.patch(
  "/profile",
  authMiddleware,
  zValidator("json", updateProfileSchema),
  async (c) => {
    const payload = c.get("user");
    const body = c.req.valid("json");

    if (body.username) {
      const existing = await getUserByUsername(body.username);
      if (existing && existing.id !== payload.id) {
        return error(c, "Username already taken", 409);
      }
    }

    const user = await updateUserProfile(payload.id, body);
    if (!user) return error(c, "User not found", 404);
    return ok(c, user);
  }
);

userRouter.post(
  "/profile/change-password",
  authMiddleware,
  zValidator("json", changePasswordSchema),
  async (c) => {
    const payload = c.get("user");
    const { password } = c.req.valid("json");
    const user = await updateUserPassword("", password, payload.id);
    if (!user) return error(c, "User not found", 404);
    return ok(c, { message: "Password updated successfully" });
  }
);

userRouter.get(
  "/",
  requirePermission("users:read"),
  zValidator("query", getUsersQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const users = await getAllUsers(query);
    return ok(c, users);
  }
);

userRouter.get("/:id", requirePermission("users:read"), zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const user = await getUserById(id);
  if (!user) return error(c, "User not found", 404);
  return ok(c, user);
});

userRouter.post(
  "/",
  requirePermission("users:create"),
  zValidator("json", insertUserSchema),
  async (c) => {
    const body = c.req.valid("json");
    const user = await createUser(body);
    return ok(c, user, 201);
  }
);

userRouter.delete("/:id", requirePermission("users:delete"), zValidator("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const user = await deleteUser(id);
  if (!user) return error(c, "User not found", 404);
  return ok(c, user);
});

userRouter.post(
  "/change-password",
  requirePermission("users:update"),
  zValidator("json", adminChangePasswordSchema),
  async (c) => {
    const { username, password } = c.req.valid("json");
    const user = await updateUserPassword(username, password);
    if (!user) return error(c, "User not found", 404);
    return ok(c, { message: "Password updated successfully", user });
  }
);

export { userRouter };
