import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Server-only Drizzle client (direct Postgres via DATABASE_URL).
 * Browser / RLS-scoped app queries still use Supabase client + auth session.
 */
export function createDb(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error(
      "Missing DATABASE_URL. Copy .env.example → .env.local and paste your Supabase Postgres connection string.",
    );
  }
  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof createDb>;
