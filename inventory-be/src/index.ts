import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { env } from "./env";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { apiRouter } from "./router";

import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { networkInterfaces } from "os";

const app = new Hono();

app.use(cors({
  origin: "*",
  allowHeaders: ["*"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
}));

app.use(logger());


app.route("/", apiRouter);

app.notFound(notFoundHandler);
app.onError(errorHandler);

serve({ fetch: app.fetch, port: env.PORT, hostname: "0.0.0.0" }, (info) => {
  console.log(`  Local:   http://localhost:${info.port}`);
  const nets = networkInterfaces();
  for (const iface of Object.values(nets)) {
    for (const net of iface ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        console.log(`  Network: http://${net.address}:${info.port}`);
      }
    }
  }
});
