import path from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { getMigrationDatabaseUrl } from "../src/db/env";

/**
 * Apply drizzle/ migrations with prepare:false so Supabase poolers (PgBouncer)
 * work. Prefer DIRECT_URL (session :5432) over DATABASE_URL (transaction :6543).
 */
async function main() {
  let url: string;
  try {
    url = getMigrationDatabaseUrl();
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }

  if (url.includes("6543") || url.includes("pgbouncer=true")) {
    console.warn(
      "[db:migrate] Warning: connection looks like transaction pooler.\n" +
        "  Prefer DIRECT_URL on port 5432 (session mode) for migrations.\n" +
        "  Transaction mode often fails with: prepared statement does not exist",
    );
  }

  // max:1 + prepare:false is required for reliable migrations via pooler
  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client);

  try {
    const folder = path.join(process.cwd(), "drizzle");
    console.log(`Migrating using ${url.includes("5432") ? "session/direct-style URL" : "DATABASE_URL"}…`);
    await migrate(db, { migrationsFolder: folder });
    console.log("✓ Migrations applied");
  } finally {
    await client.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
