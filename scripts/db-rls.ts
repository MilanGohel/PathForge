import postgres from "postgres";
import { getMigrationDatabaseUrl } from "../src/db/env";
import { RLS_SQL } from "../src/db/rls";

async function main() {
  let url: string;
  try {
    url = getMigrationDatabaseUrl();
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }

  // Session pooler / direct — required for multi-statement DDL + policies
  const sql = postgres(url, { prepare: false, max: 1 });
  try {
    await sql.unsafe(RLS_SQL);
    console.log("✓ RLS policies, auth trigger, and pack seed applied");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
