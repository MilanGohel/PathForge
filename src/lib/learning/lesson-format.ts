import { splitLessonH2Sections } from "./lesson-toc";

/** Soft pedagogical intents every L2 lesson should cover (titles are free). */
export const LESSON_PEDAGOGICAL_INTENTS = [
  "motivation — why this module matters",
  "core idea — the central concept",
  "how to think — mental model or approach",
  "worked example — concrete walkthrough",
  "common mistake — pitfall to avoid",
  "practice — something the learner can try",
] as const;

export const LESSON_THIN_MIN_H2 = 3;
export const LESSON_THIN_MIN_BODY_CHARS = 400;
/** Minimum non-whitespace body chars under an H2 before it counts as empty. */
export const LESSON_THIN_MIN_SECTION_CHARS = 20;

export const LESSON_OUTLINE_PROMPT = `Write ONE teachable module lesson as MDX (Markdown + optional <Callout> and <Steps>).

Teach so the learner can understand this module from the lesson alone. Aim for a focused read that fits the suggested sitting time (typically ~8–20 minutes of reading — shorter modules stay shorter; do not pad, do not write a thesis).

Pedagogical intents (cover all six; titles are FREE — do not reuse a generic template on every module):
${LESSON_PEDAGOGICAL_INTENTS.map((i) => `- ${i}`).join("\n")}

Outline rules:
- Choose clear, **topic-specific H2 titles** that fit this module.
- You MAY merge intents into fewer H2s when that reads better.
- You MAY add extra topic-specific H2s (comparison, checklist, etc.) when useful.
- Optional closing H2 (e.g. next steps) only when it helps — not mandatory boilerplate.
- Prefer plain language; one small code snippet only when it truly helps.

Optional diagrams (Mermaid):
- You MAY include 0–2 fenced \`\`\`mermaid blocks when a diagram materially helps (flow, relationship, comparison).
- Never invent diagrams for decoration. If unsure, skip.
- Do not use other diagram languages or raw <svg>.

MDX rules:
- Use GFM: headings, lists, bold, fenced code blocks, tables.
- You MAY use:
  <Callout type="info|tip|warn">...</Callout>
  <Steps>
  1. First step
  2. Second step
  </Steps>
- Do NOT use import/export, raw HTML, scripts, or unknown components.
- Do NOT invent URLs inside the lesson body.

Also return:
- quiz: 2–4 multiple-choice items (structured JSON, not inside MDX)
- resourceQueries: 1–2 short web search queries for optional deeper links (we fetch real URLs; max 3 shown, ≤1 video)
`;

export function isLegacyLesson(input: {
  mdx: string | null | undefined;
  cards: unknown;
}): boolean {
  const mdx = (input.mdx ?? "").trim();
  if (mdx.length >= 200) return false;
  const cards = input.cards;
  return Array.isArray(cards) && cards.length > 0;
}

export type LessonThinness = {
  thin: boolean;
  reasons: string[];
};

/** Count substantial body text (fences/links stripped so code dumps don't fake density). */
function bodyCharCount(body: string): number {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*_`~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

/**
 * Structural thinness check for lesson MDX.
 * Does NOT require legacy fixed H2 titles.
 */
export function presentLessonThinness(
  mdx: string | null | undefined,
): LessonThinness {
  const source = (mdx ?? "").replace(/\r\n/g, "\n");
  const reasons: string[] = [];

  if (!source.trim()) {
    return {
      thin: true,
      reasons: ["Lesson body is empty"],
    };
  }

  const sections = splitLessonH2Sections(source);
  if (sections.length < LESSON_THIN_MIN_H2) {
    reasons.push(
      `Fewer than ${LESSON_THIN_MIN_H2} sections (found ${sections.length})`,
    );
  }

  const bodyChars = sections.reduce((n, s) => n + bodyCharCount(s.body), 0);
  if (bodyChars < LESSON_THIN_MIN_BODY_CHARS) {
    reasons.push(
      `Body text under ${LESSON_THIN_MIN_BODY_CHARS} characters (found ${bodyChars})`,
    );
  }

  const emptyTitles = sections
    .filter((s) => bodyCharCount(s.body) < LESSON_THIN_MIN_SECTION_CHARS)
    .map((s) => s.title);
  if (emptyTitles.length > 0) {
    reasons.push(
      `Empty section${emptyTitles.length > 1 ? "s" : ""}: ${emptyTitles.join(", ")}`,
    );
  }

  return { thin: reasons.length > 0, reasons };
}

const ALLOWED_HTML_TAG =
  /<\/?(?!Callout\b|Steps\b|strong\b|em\b|code\b|pre\b|a\b|ul\b|ol\b|li\b|p\b|h[1-6]\b|blockquote\b|hr\b|table\b|thead\b|tbody\b|tr\b|th\b|td\b|br\b)([a-zA-Z][\w:-]*)\b[^>]*>/g;

/**
 * Strip dangerous MDX bits before compile; keep Callout/Steps tags.
 * Fence-aware: does not touch contents of fenced code/mermaid blocks.
 */
export function sanitizeLessonMdx(source: string): string {
  const lines = source.trim().replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inFence = false;

  for (const line of lines) {
    const fence = line.match(/^(\s*)(`{3,}|~{3,})/);
    if (fence) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    if (/^\s*(import|export)\s/.test(line)) continue;
    let cleaned = line.replace(/<\/?(script|style)[^>]*>/gi, "");
    cleaned = cleaned.replace(ALLOWED_HTML_TAG, "");
    out.push(cleaned);
  }

  return out.join("\n").trim();
}
