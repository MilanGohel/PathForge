import { describe, expect, it } from "vitest";
import { extractLessonToc, slugifyHeading } from "./lesson-toc";

const VARIED = [
  "## Why context windows bite",
  "",
  "Body.",
  "",
  "### Nested detail",
  "",
  "Should be ignored.",
  "",
  "## The sliding window model",
  "",
  "Text.",
  "",
  "## A truncation walkthrough",
  "",
  "More.",
  "",
].join("\n");

describe("extractLessonToc", () => {
  it("extracts varied free H2 titles", () => {
    const toc = extractLessonToc(VARIED);
    expect(toc.map((t) => t.title)).toEqual([
      "Why context windows bite",
      "The sliding window model",
      "A truncation walkthrough",
    ]);
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

  it("ignores headings inside fenced blocks", () => {
    const toc = extractLessonToc(
      ["## Real", "", "```", "## Fake", "```", "", "## Also real", ""].join("\n"),
    );
    expect(toc.map((t) => t.title)).toEqual(["Real", "Also real"]);
  });

  it("slugifyHeading matches TOC ids for free titles", () => {
    for (const h of ["Why context bites", "Try it yourself"]) {
      const toc = extractLessonToc(`## ${h}\n\nbody\n`);
      expect(toc[0].id).toBe(slugifyHeading(h));
    }
  });
});
