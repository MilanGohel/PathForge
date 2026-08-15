/**
 * Extract a table of contents from lesson MDX/markdown.
 * H2-only (whatever titles the lesson uses); stable anchor-safe ids.
 */

export type TocEntry = {
  id: string;
  title: string;
};

export type H2Section = {
  title: string;
  /** Body text between this H2 and the next (or EOF), excluding the heading line. */
  body: string;
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
export function cleanHeadingTitle(raw: string): string {
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
 * Fence-aware H2 split shared by TOC and thinness checks.
 * Ignores H1/H3+ and headings inside fenced code blocks.
 */
export function splitLessonH2Sections(source: string): H2Section[] {
  if (!source?.trim()) return [];

  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const sections: H2Section[] = [];
  let inFence = false;
  let current: H2Section | null = null;

  for (const line of lines) {
    const fence = line.match(/^(\s*)(`{3,}|~{3,})/);
    if (fence) {
      inFence = !inFence;
      if (current) current.body += `${line}\n`;
      continue;
    }
    if (!inFence) {
      const m = line.match(/^##\s+(?!#)(.+?)\s*#*\s*$/);
      if (m) {
        const title = cleanHeadingTitle(m[1]);
        if (!title) continue;
        current = { title, body: "" };
        sections.push(current);
        continue;
      }
    }
    if (current) current.body += `${line}\n`;
  }

  return sections;
}

/**
 * Parse H2 headings (`## Title`) from lesson source into TOC entries.
 */
export function extractLessonToc(source: string): TocEntry[] {
  const sections = splitLessonH2Sections(source);
  const entries: TocEntry[] = [];
  const used = new Map<string, number>();

  for (const section of sections) {
    const base = slugifyHeading(section.title);
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    const id = n === 0 ? base : `${base}-${n + 1}`;
    entries.push({ id, title: section.title });
  }

  return entries;
}
