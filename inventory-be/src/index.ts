import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { env } from "./env";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { apiRouter } from "./router";

import { Scalar } from "@scalar/hono-api-reference";
import openApiSpec from "../docs/openapi.json";
import { cors } from "hono/cors";

const app = new Hono();

app.use(cors({
  origin: "*",
  allowHeaders: ["*"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
}));

app.use(logger());

app.get("/openapi.json", (c) => c.json(openApiSpec));

app.get(
  "/reference",
  Scalar({
    url: "/openapi.json",
  })
);

app.route("/", apiRouter);

app.notFound(notFoundHandler);
app.onError(errorHandler);

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});
