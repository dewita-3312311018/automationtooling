import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import { env } from "../env";
import * as schema from "./schema";

const pool = createPool({
  uri: env.DATABASE_URL,
  timezone: "Z",
});

// Force every connection to use UTC so NOW() / CURRENT_TIMESTAMP return UTC values
pool.on("connection", (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

const db = drizzle({ client: pool, schema, mode: "default" });

export { db };
