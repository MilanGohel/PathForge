import { THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * Inline boot script — runs before paint to avoid theme flash.
 * Keep in sync with applyTheme() in src/lib/theme.ts.
 */
export function ThemeScript() {
  const code = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"&&t!=="system")t="system";var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.dataset.theme=t;}catch(e){}})();`;

  return (
    <script
      // Early theme boot — must stay inline and synchronous
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
