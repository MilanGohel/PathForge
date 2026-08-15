import { createClient } from "@/lib/supabase/server";
import { createSupabaseBudgetStore } from "./budget-store";
import {
  createGatewayModelClient,
  createSerperSearchClient,
  LearningGeneration,
} from "./generation";

/** Production LearningGeneration wired to Gateway + Serper + Supabase budgets */
export async function getLearningGeneration() {
  const supabase = await createClient();
  return new LearningGeneration({
    models: createGatewayModelClient(),
    search: createSerperSearchClient(),
    budget: createSupabaseBudgetStore(supabase),
  });
}
