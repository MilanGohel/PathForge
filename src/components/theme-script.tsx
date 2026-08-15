import Script from "next/script";
import { THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * Early theme boot — beforeInteractive so it runs before paint/hydration.
 * Keep in sync with applyTheme() in src/lib/theme.ts.
 * Must be rendered from the root layout (Next.js requirement).
 */
export function ThemeScript() {
  const code = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"&&t!=="system")t="system";var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.dataset.theme=t;}catch(e){}})();`;

  return (
    <Script id="pathforge-theme-boot" strategy="beforeInteractive">
      {code}
    </Script>
  );
}
