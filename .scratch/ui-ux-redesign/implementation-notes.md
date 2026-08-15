# UI/UX redesign — implementation notes

## Theme strategy

**System preference via CSS** (`prefers-color-scheme` on `:root` tokens in `src/app/globals.css`).

- No `class="dark"` toggle in this pass.
- Tokens cover light and dark (background, foreground, muted, border, card, primary, danger, warning, success, ring).
- App and marketing both consume the same token set.

## Shells

`SiteChrome` chooses marketing vs app header/footer from **auth state** (signed-in → app chrome). Marketing pages when signed out get marketing chrome; signed-in users keep app chrome even on `/` so account actions stay available.

## Generation progress

Pure presenter: `presentGenerationProgress({ phase, flow })` in `src/lib/learning/generation-progress.ts`.  
UI: `GenerationStatus` — no looping fake checklist. Diagnostic submit shows `l0_building` for the combined score+L0 server call.

## Lesson TOC

`extractLessonToc` + `slugifyHeading`; MDX h2 ids assigned from TOC order via `createLessonMdxComponents(toc)` so anchors stay unique and match the sticky outline.
