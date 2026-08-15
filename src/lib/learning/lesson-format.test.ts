import { describe, expect, it } from "vitest";
import { isLegacyLesson, sanitizeLessonMdx } from "./lesson-format";

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
});
