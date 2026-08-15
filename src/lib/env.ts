/**
 * Server-side env access. Missing keys throw only when the feature is used,
 * so the app can boot and show UI before keys are pasted.
 */

function read(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : undefined;
}

function requireEnv(name: string): string {
  const v = read(name);
  if (!v) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example → .env.local and paste your key.`,
    );
  }
  return v;
}

export const env = {
  siteUrl: () =>
    read("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",

  supabaseUrl: () => requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => read("SUPABASE_SERVICE_ROLE_KEY"),

  aiGatewayApiKey: () => requireEnv("AI_GATEWAY_API_KEY"),
  modelFast: () => read("AI_MODEL_FAST") ?? "openai/gpt-4.1-mini",
  modelStrong: () =>
    read("AI_MODEL_STRONG") ?? "anthropic/claude-sonnet-4.6",

  serperApiKey: () => requireEnv("SERPER_API_KEY"),
  youtubeApiKey: () => read("YOUTUBE_API_KEY"),

  generationDailyBudget: () => {
    const n = Number(read("GENERATION_DAILY_BUDGET") ?? "40");
    return Number.isFinite(n) && n > 0 ? n : 40;
  },

  hasPublicSupabase: () =>
    Boolean(read("NEXT_PUBLIC_SUPABASE_URL") && read("NEXT_PUBLIC_SUPABASE_ANON_KEY")),
};
