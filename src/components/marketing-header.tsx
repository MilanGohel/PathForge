import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <BrandMark />
          Pathforge
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/#how-it-works"
            className="hidden rounded-lg px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground sm:inline"
          >
            How it works
          </Link>
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="ml-1 inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
          >
            Start learning
          </Link>
        </nav>
      </div>
    </header>
  );
}
