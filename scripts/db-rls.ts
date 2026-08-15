import { config } from "dotenv";
import postgres from "postgres";
import { RLS_SQL } from "../src/db/rls";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "Missing DATABASE_URL. Add Supabase Postgres URI to .env.local first.",
    );
    process.exit(1);
  }

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
