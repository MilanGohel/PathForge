import { defineConfig } from "drizzle-kit";
import { getMigrationDatabaseUrl } from "./src/db/env";

let url: string;
try {
  url = getMigrationDatabaseUrl();
} catch (e) {
  console.warn(
    `[drizzle.config] ${(e as Error).message}\n` +
      "  DIRECT_URL = session pooler :5432 (migrations)\n" +
      "  DATABASE_URL = transaction pooler :6543?pgbouncer=true (app)",
  );
  url = "";
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Migrations must use session mode (DIRECT_URL), not transaction pooler
    url,
  },
  strict: true,
  verbose: true,
});
