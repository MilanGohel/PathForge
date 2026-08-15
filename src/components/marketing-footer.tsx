import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-muted-bg/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-sm space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <BrandMark size="sm" />
            Pathforge
          </div>
          <p className="text-sm text-muted">
            Personalized learning paths that teach — generate on demand, guide
            with MDX lessons, curate a few real resources.
          </p>
        </div>
        <div className="flex flex-wrap gap-8 text-sm">
          <div className="space-y-2">
            <p className="font-medium text-foreground">Product</p>
            <Link
              href="/#how-it-works"
              className="block text-muted hover:text-foreground"
            >
              How it works
            </Link>
            <Link href="/#faq" className="block text-muted hover:text-foreground">
              FAQ
            </Link>
            <Link
              href="/paths/new?pack=ai-engineering"
              className="block text-muted hover:text-foreground"
            >
              AI Engineering pack
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">Account</p>
            <Link href="/login" className="block text-muted hover:text-foreground">
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="block text-muted hover:text-foreground"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        Pathforge — generate, guide, teach, curate
      </div>
    </footer>
  );
}
