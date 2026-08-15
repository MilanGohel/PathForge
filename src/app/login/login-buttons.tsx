"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LoginButtons({ next }: { next: string }) {
  async function signIn(provider: "google" | "github") {
    const supabase = createClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      window.location.href = `/login?error=${encodeURIComponent(error.message)}`;
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button type="button" onClick={() => void signIn("google")} className="w-full">
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => void signIn("github")}
        className="w-full"
      >
        Continue with GitHub
      </Button>
    </div>
  );
}
