import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <BrandMark size="sm" />
          <span>© {year} Pathforge</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <a href="/#how" className="hover:text-foreground">
            How it works
          </a>
          <a href="/#faq" className="hover:text-foreground">
            FAQ
          </a>
          <Link
            href="/paths/new?pack=ai-engineering"
            className="hover:text-foreground"
          >
            AI Engineering
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Log in
          </Link>
        </div>
      </div>
    </footer>
  );
}
