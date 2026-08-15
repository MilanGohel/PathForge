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
      {signedIn ? <AppHeader email={email} /> : <MarketingHeader />}
      <main className="flex-1">{children}</main>
      {signedIn ? <AppFooter /> : <MarketingFooter />}
    </>
  );
}
