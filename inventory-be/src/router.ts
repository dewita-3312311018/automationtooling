import { Hono } from "hono";
import { userRouter } from "./modules/user/user.router";
import { authRouter } from "./modules/auth/auth.router";
import { rbacRouter } from "./modules/rbac/rbac.router";
import { locationRouter, publicLocationRouter } from "./modules/location/location.router";
import { stockRouter } from "./modules/stock/stock.router";
import { requestRouter } from "./modules/request/request.router";
import { auditRouter } from "./modules/audit/audit.router";
import { notificationRouter } from "./modules/notification/notification.router";
import { authMiddleware } from "./middleware/auth";

const apiRouter = new Hono();

apiRouter.route("/auth", authRouter);
apiRouter.route("/public/locations", publicLocationRouter);

apiRouter.use("/*", authMiddleware);

apiRouter.route("/users", userRouter);
apiRouter.route("/rbac", rbacRouter);
apiRouter.route("/locations", locationRouter);
apiRouter.route("/stocks", stockRouter);
apiRouter.route("/requests", requestRouter);
apiRouter.route("/audits", auditRouter);
apiRouter.route("/notifications", notificationRouter);

export { apiRouter };
