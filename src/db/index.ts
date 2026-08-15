import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getRuntimeDatabaseUrl } from "./env";
import * as schema from "./schema";

/**
 * Server-only Drizzle client.
 * Uses DATABASE_URL (transaction pooler) when set; app data access via Supabase
 * client + RLS remains the primary path for user-scoped queries.
 */
export function createDb(connectionString?: string) {
  const url = connectionString ?? getRuntimeDatabaseUrl();
  const client = postgres(url, { prepare: false });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof createDb>;
