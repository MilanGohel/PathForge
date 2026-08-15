import { createClient } from "@/lib/supabase/server";
import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";

/**
 * App-wide chrome: marketing header/footer when signed out,
 * denser app chrome when signed in.
 */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
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

  const signedIn = Boolean(email);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      {signedIn ? <AppHeader email={email} /> : <MarketingHeader />}
      <main id="main" className="flex-1">
        {children}
      </main>
      {signedIn ? <AppFooter /> : <MarketingFooter />}
    </>
  );
}
