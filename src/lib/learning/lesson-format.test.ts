import { describe, expect, it } from "vitest";
import {
  isLegacyLesson,
  LESSON_SKELETON_HEADINGS,
  presentSkeletonCompleteness,
  sanitizeLessonMdx,
} from "./lesson-format";

describe("lesson-format", () => {
  it("detects legacy card lessons", () => {
    expect(
      isLegacyLesson({
        mdx: "",
        cards: [{ id: "1", kind: "concept", title: "t", body: "b" }],
      }),
    ).toBe(true);
    expect(
      isLegacyLesson({
        mdx: "## Why this matters\n".repeat(40),
        cards: [],
      }),
    ).toBe(false);
  });

  it("strips import/export from mdx", () => {
    const s = sanitizeLessonMdx(`import x from "y"\n## Why this matters\nHi`);
    expect(s).not.toMatch(/import/);
    expect(s).toContain("Why this matters");
  });

  it("reports missing skeleton headings", () => {
    const partial = "## Why this matters\n\nHi\n\n## The idea\n\nBody\n";
    const r = presentSkeletonCompleteness(partial);
    expect(r.complete).toBe(false);
    expect(r.missingHeadings).toContain("Worked example");
    expect(r.missingHeadings).not.toContain("Why this matters");
  });

  it("accepts full skeleton regardless of optional extra H2", () => {
    const full = LESSON_SKELETON_HEADINGS.map((h) => `## ${h}\n\nText.\n`).join(
      "\n",
    ) + "\n## When you're ready\n\nGo.\n";
    expect(presentSkeletonCompleteness(full).complete).toBe(true);
    expect(presentSkeletonCompleteness(full).missingHeadings).toEqual([]);
  });

  it("ignores headings inside fences", () => {
    const outside = LESSON_SKELETON_HEADINGS.filter((h) => h !== "The idea");
    const mdx = [
      ...outside.map((h) => `## ${h}\n\nx\n`),
      "```",
      "## The idea",
      "```",
    ].join("\n");
    // The idea only appeared inside fence → missing
    const r = presentSkeletonCompleteness(mdx);
    expect(r.missingHeadings).toEqual(["The idea"]);
    expect(r.complete).toBe(false);
  });
});
