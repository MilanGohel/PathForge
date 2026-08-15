import { describe, expect, it } from "vitest";
import { LESSON_SKELETON_HEADINGS } from "./lesson-format";
import { extractLessonToc, slugifyHeading } from "./lesson-toc";

const SAMPLE = [
  ...LESSON_SKELETON_HEADINGS.flatMap((h, i) =>
    i === 1
      ? [`## ${h}`, "", "Body.", "", "### Nested detail", "", "Should be ignored.", ""]
      : [`## ${h}`, "", "Text.", ""],
  ),
].join("\n");

describe("extractLessonToc", () => {
  it("extracts H2 titles from teaching skeleton MDX", () => {
    const toc = extractLessonToc(SAMPLE);
    expect(toc.map((t) => t.title)).toEqual([...LESSON_SKELETON_HEADINGS]);
  });

  it("ignores H3 headings", () => {
    const toc = extractLessonToc("## Main\n\n### Sub\n\n## Other\n");
    expect(toc.map((t) => t.title)).toEqual(["Main", "Other"]);
  });

  it("returns empty list for empty or malformed input", () => {
    expect(extractLessonToc("")).toEqual([]);
    expect(extractLessonToc("   ")).toEqual([]);
    expect(extractLessonToc("no headings here\njust text")).toEqual([]);
  });

  it("produces unique anchor-safe ids", () => {
    const toc = extractLessonToc("## Foo Bar\n\n## Foo Bar\n\n## Hello!\n");
    const ids = toc.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("strips simple MDX/emphasis noise from titles", () => {
    const toc = extractLessonToc("## **Bold title**\n\n## Title with `code`\n");
    expect(toc[0].title).toBe("Bold title");
    expect(toc[1].title).toContain("code");
  });

  it("slugifyHeading matches TOC ids for skeleton headings", () => {
    for (const h of LESSON_SKELETON_HEADINGS) {
      const toc = extractLessonToc(`## ${h}\n\nbody\n`);
      expect(toc[0].id).toBe(slugifyHeading(h));
    }
  });
});
