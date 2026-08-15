# UI/UX redesign — implementation notes

## Theme strategy

**Class-based dark mode** with optional system follow:

- Tokens on `:root` (light) and `html.dark` (dark) in `src/app/globals.css`.
- Preference stored in `localStorage` key `pathforge-theme`: `light` | `dark` | `system`.
- Navbar `ThemeToggle` cycles system → light → dark → system.
- Inline `ThemeScript` in root layout applies class before paint (no FOUC).
- Fallback CSS: if no `data-theme`, still honor `prefers-color-scheme` before JS.

## Shells

`SiteChrome` chooses marketing vs app header/footer from **auth state** (signed-in → app chrome). Marketing pages when signed out get marketing chrome; signed-in users keep app chrome even on `/` so account actions stay available.

## Generation progress

Pure presenter: `presentGenerationProgress({ phase, flow })` in `src/lib/learning/generation-progress.ts`.  
UI: `GenerationStatus` — no looping fake checklist. Diagnostic submit shows `l0_building` for the combined score+L0 server call.

## Lesson TOC

`extractLessonToc` + `slugifyHeading`; MDX h2 ids assigned from TOC order via `createLessonMdxComponents(toc)` so anchors stay unique and match the sticky outline.
