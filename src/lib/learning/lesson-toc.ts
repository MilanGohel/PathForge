/**
 * Extract a table of contents from lesson MDX/markdown.
 * H2-only (teaching skeleton); stable anchor-safe ids.
 */

export type TocEntry = {
  id: string;
  title: string;
};

/** Anchor-safe slug shared with MDX h2 rendering. */
export function slugifyHeading(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-") || "section"
  );
}

/** Strip light markdown/MDX emphasis from a heading title. */
function cleanTitle(raw: string): string {
  return raw
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse H2 headings (`## Title`) from lesson source.
 * Ignores H1/H3+ and headings inside fenced code blocks.
 */
export function extractLessonToc(source: string): TocEntry[] {
  if (!source?.trim()) return [];

  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const entries: TocEntry[] = [];
  const used = new Map<string, number>();
  let inFence = false;

  for (const line of lines) {
    const fence = line.match(/^(\s*)(`{3,}|~{3,})/);
    if (fence) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    // Exactly ## (not ###+)
    const m = line.match(/^##\s+(?!#)(.+?)\s*#*\s*$/);
    if (!m) continue;

    const title = cleanTitle(m[1]);
    if (!title) continue;

    let base = slugifyHeading(title);
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    const id = n === 0 ? base : `${base}-${n + 1}`;

    entries.push({ id, title });
  }

  return entries;
}
