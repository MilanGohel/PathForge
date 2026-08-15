import Link from "next/link";
import { signOut } from "@/lib/learning/actions";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export function AppHeader({ email }: { email: string | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <BrandMark size="sm" />
          Pathforge
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/dashboard"
            className="hidden rounded-lg px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground sm:inline"
          >
            Dashboard
          </Link>
          <Link
            href="/paths/new"
            className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground"
          >
            New path
          </Link>
          {email ? (
            <span className="hidden max-w-[10rem] truncate px-2 text-xs text-muted md:inline">
              {email}
            </span>
          ) : null}
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </nav>
      </div>
    </header>
  );
}
