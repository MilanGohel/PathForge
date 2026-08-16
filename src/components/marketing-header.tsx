import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <BrandMark />
          <span className="font-display text-lg">Pathforge</span>
        </Link>
        <nav
          className="hidden items-center gap-7 text-sm text-muted md:flex"
          aria-label="Marketing"
        >
          <a
            href="/#how"
            className="transition-colors hover:text-foreground"
          >
            How it works
          </a>
          <a
            href="/#features"
            className="transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a href="/#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            Log in
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: "sm" }),
              "rounded-full px-4 text-white",
            )}
          >
            Start learning
          </Link>
        </div>
      </div>
    </header>
  );
}
