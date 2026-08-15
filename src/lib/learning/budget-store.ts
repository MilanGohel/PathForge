import type { SupabaseClient } from "@supabase/supabase-js";
import type { BudgetStore } from "./generation";

export function createSupabaseBudgetStore(
  supabase: SupabaseClient,
): BudgetStore {
  return {
    async countToday(userId: string) {
      const start = new Date();
      start.setUTCHours(0, 0, 0, 0);
      const { count, error } = await supabase
        .from("generation_events")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("ok", true)
        .gte("created_at", start.toISOString());
      if (error) throw error;
      return count ?? 0;
    },

    async record(event) {
      const { error } = await supabase.from("generation_events").insert({
        user_id: event.userId,
        level: event.level,
        entity_id: event.entityId ?? null,
        ok: event.ok,
        error_message: event.errorMessage ?? null,
        meta: event.meta ?? {},
      });
      if (error) throw error;
    },
  };
}

export function createMemoryBudgetStore(): BudgetStore & {
  events: Array<{ userId: string; level: string; ok: boolean }>;
} {
  const events: Array<{
    userId: string;
    level: string;
    ok: boolean;
    at: number;
  }> = [];
  return {
    events,
    async countToday(userId: string) {
      const start = new Date();
      start.setUTCHours(0, 0, 0, 0);
      return events.filter(
        (e) => e.userId === userId && e.ok && e.at >= start.getTime(),
      ).length;
    },
    async record(event) {
      events.push({
        userId: event.userId,
        level: event.level,
        ok: event.ok,
        at: Date.now(),
      });
    },
  };
}
