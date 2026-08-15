/** Fixed teaching skeleton every L2 module body must follow (grill lock). */
export const LESSON_SKELETON_HEADINGS = [
  "Why this matters",
  "The idea",
  "How to think about it",
  "Worked example",
  "Common mistake",
  "Try this",
] as const;

export const LESSON_SKELETON_PROMPT = `Write ONE teachable module lesson as MDX (Markdown + optional <Callout> and <Steps>).

Target depth: ~10–15 minute read. Detailed enough to learn the topic from this module alone — NOT a research paper. Plain language first; one small code snippet only when it truly helps.

You MUST include these H2 sections in order (exact titles):
${LESSON_SKELETON_HEADINGS.map((h) => `## ${h}`).join("\n")}

Optional final H2: ## When you're ready

MDX rules:
- Use GFM: headings, lists, bold, fenced code blocks.
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

export type SkeletonCompleteness = {
  complete: boolean;
  missingHeadings: string[];
};

/**
 * Check MDX for required teaching-skeleton H2 titles (presence, not order).
 */
export function presentSkeletonCompleteness(
  mdx: string | null | undefined,
): SkeletonCompleteness {
  const source = (mdx ?? "").replace(/\r\n/g, "\n");
  if (!source.trim()) {
    return {
      complete: false,
      missingHeadings: [...LESSON_SKELETON_HEADINGS],
    };
  }

  const found = new Set<string>();
  let inFence = false;
  for (const line of source.split("\n")) {
    const fence = line.match(/^(\s*)(`{3,}|~{3,})/);
    if (fence) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = line.match(/^##\s+(?!#)(.+?)\s*#*\s*$/);
    if (!m) continue;
    const title = m[1]
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
    for (const required of LESSON_SKELETON_HEADINGS) {
      if (title.toLowerCase() === required.toLowerCase()) {
        found.add(required);
      }
    }
  }

  const missingHeadings = LESSON_SKELETON_HEADINGS.filter((h) => !found.has(h));
  return {
    complete: missingHeadings.length === 0,
    missingHeadings: [...missingHeadings],
  };
}

/** Strip dangerous MDX bits before compile; keep Callout/Steps tags. */
export function sanitizeLessonMdx(source: string): string {
  let s = source.trim();
  // Drop import/export lines
  s = s
    .split("\n")
    .filter((line) => !/^\s*(import|export)\s/.test(line))
    .join("\n");
  // Remove script/style tags
  s = s.replace(/<\/?(script|style)[^>]*>/gi, "");
  // Neutralize obvious raw HTML except our allowlisted tags
  s = s.replace(
    /<\/?(?!Callout\b|Steps\b|strong\b|em\b|code\b|pre\b|a\b|ul\b|ol\b|li\b|p\b|h[1-6]\b|blockquote\b|hr\b|table\b|thead\b|tbody\b|tr\b|th\b|td\b|br\b)([a-zA-Z][\w:-]*)\b[^>]*>/g,
    "",
  );
  return s.trim();
}
