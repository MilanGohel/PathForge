import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

/**
 * Supabase connection split:
 * - DATABASE_URL  → transaction pooler (:6543, pgbouncer=true) — app runtime queries
 * - DIRECT_URL    → session pooler (:5432) — migrations, RLS DDL, drizzle-kit
 *
 * Always prefer DIRECT_URL for schema changes; fall back to DATABASE_URL if unset.
 */
export function getMigrationDatabaseUrl(): string {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Missing DIRECT_URL (preferred) or DATABASE_URL. Add Supabase pooler URIs to .env.local.",
    );
  }
  return url;
}

export function getRuntimeDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!url) {
    throw new Error(
      "Missing DATABASE_URL. Add the transaction-mode pooler URI to .env.local.",
    );
  }
  return url;
}
