import { describe, expect, it } from "vitest";
import {
  isLegacyLesson,
  LESSON_THIN_MIN_BODY_CHARS,
  LESSON_THIN_MIN_H2,
  presentLessonThinness,
  sanitizeLessonMdx,
} from "./lesson-format";

function section(title: string, body: string) {
  return `## ${title}\n\n${body}\n`;
}

/** Healthy lesson with varied free titles and enough body text. */
function healthyVariedLesson() {
  const pad = "x".repeat(80);
  return [
    section("Why context windows bite", `Real apps fail when history grows. ${pad}`),
    section("The sliding window mental model", `Think of a fixed aperture over tokens. ${pad}`),
    section("A tiny truncation walkthrough", `Start with the full chat, drop oldest turns. ${pad}`),
    section("Where people over-truncate", `Cutting the system prompt is a common miss. ${pad}`),
    section("Try it on your last chat log", `Pick one thread and mark what you would keep. ${pad}`),
  ].join("\n");
}

/** Legacy six-title lesson that is still rich enough not to be thin. */
function richLegacySkeletonLesson() {
  const pad = "Body with enough substance for learners. ".repeat(4);
  return [
    "Why this matters",
    "The idea",
    "How to think about it",
    "Worked example",
    "Common mistake",
    "Try this",
  ]
    .map((h) => section(h, pad))
    .join("\n");
}

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

  it("leaves mermaid fences intact while stripping imports", () => {
    const src = [
      'import x from "y"',
      "## Flow",
      "",
      "```mermaid",
      "graph TD",
      "  A-->B",
      "```",
      "",
      "More text here.",
    ].join("\n");
    const s = sanitizeLessonMdx(src);
    expect(s).not.toMatch(/import/);
    expect(s).toContain("```mermaid");
    expect(s).toContain("graph TD");
  });

  it("does not corrupt mermaid classDiagram syntax inside fences", () => {
    const src = [
      "## Model",
      "",
      "```mermaid",
      "classDiagram",
      "  class Store {",
      "    <<interface>>",
      "    +get()",
      "  }",
      "```",
    ].join("\n");
    const s = sanitizeLessonMdx(src);
    expect(s).toContain("<<interface>>");
    expect(s).toContain("classDiagram");
  });

  it("still strips import lines outside fences only", () => {
    const src = [
      "```",
      "import fake from 'inside'",
      "```",
      'import real from "out"',
      "## Hi",
    ].join("\n");
    const s = sanitizeLessonMdx(src);
    expect(s).toContain("import fake from 'inside'");
    expect(s).not.toMatch(/import real/);
  });

  describe("presentLessonThinness", () => {
    it("exports locked thresholds", () => {
      expect(LESSON_THIN_MIN_H2).toBe(3);
      expect(LESSON_THIN_MIN_BODY_CHARS).toBe(400);
    });

    it("flags empty mdx as thin", () => {
      const r = presentLessonThinness("");
      expect(r.thin).toBe(true);
      expect(r.reasons.length).toBeGreaterThan(0);
    });

    it("flags fewer than 3 H2s", () => {
      const pad = "y".repeat(200);
      const mdx = [
        section("Only one", pad),
        section("Only two", pad),
      ].join("\n");
      const r = presentLessonThinness(mdx);
      expect(r.thin).toBe(true);
      expect(r.reasons.some((x) => /3|heading|section/i.test(x))).toBe(true);
    });

    it("flags 3 H2s with under 400 body chars", () => {
      const mdx = [
        section("A", "short"),
        section("B", "short"),
        section("C", "short"),
      ].join("\n");
      const r = presentLessonThinness(mdx);
      expect(r.thin).toBe(true);
      expect(r.reasons.some((x) => /400|body|short/i.test(x))).toBe(true);
    });

    it("flags an empty H2 section even when H2 count and body size pass", () => {
      const pad = "z".repeat(150);
      const mdx = [
        section("Intro", pad),
        "## Hollow section\n",
        section("Close", pad),
        section("Practice", pad),
      ].join("\n");
      const r = presentLessonThinness(mdx);
      expect(r.thin).toBe(true);
      expect(r.reasons.some((x) => /empty/i.test(x))).toBe(true);
    });

    it("accepts a healthy varied-title lesson", () => {
      const r = presentLessonThinness(healthyVariedLesson());
      expect(r.thin).toBe(false);
      expect(r.reasons).toEqual([]);
    });

    it("does not flag a rich legacy six-title lesson as thin", () => {
      const r = presentLessonThinness(richLegacySkeletonLesson());
      expect(r.thin).toBe(false);
      expect(r.reasons).toEqual([]);
    });

    it("ignores headings inside fences when counting H2s", () => {
      const pad = "w".repeat(200);
      // Only two real H2s outside fences
      const mdx = [
        section("Real one", pad),
        "```",
        "## Fake inside fence",
        "```",
        section("Real two", pad),
      ].join("\n");
      const r = presentLessonThinness(mdx);
      expect(r.thin).toBe(true);
      expect(r.reasons.some((x) => /3|heading|section/i.test(x))).toBe(true);
    });
  });
});
