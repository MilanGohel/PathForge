import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/learning/actions";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  let email: string | null = null;
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      email = data.user?.email ?? null;
    } catch {
      email = null;
    }
  }

  return (
    <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href={email ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-xs text-white">
            Pf
          </span>
          Pathforge
        </Link>
        <nav className="flex items-center gap-2">
          {email ? (
            <>
              <Link
                href="/dashboard"
                className="hidden rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 sm:inline"
              >
                Dashboard
              </Link>
              <Link
                href="/paths/new"
                className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                New path
              </Link>
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-8 items-center rounded-md bg-teal-600 px-3 text-xs font-medium text-white hover:bg-teal-500"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
