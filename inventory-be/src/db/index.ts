import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import { env } from "../env";
import * as schema from "./schema";

const pool = createPool(env.DATABASE_URL);
const db = drizzle({ client: pool, schema, mode: "default" });

export { db };
