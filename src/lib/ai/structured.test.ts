import { describe, expect, it } from "vitest";
import { extractJsonCandidate } from "./structured";

describe("extractJsonCandidate", () => {
  it("parses fenced json", () => {
    const raw = 'Sure!\n```json\n{"title":"AI","stages":[]}\n```\n';
    expect(JSON.parse(extractJsonCandidate(raw))).toEqual({
      title: "AI",
      stages: [],
    });
  });

  it("parses object with leading prose", () => {
    const raw = 'Here is the path:\n{"title":"X","estHours":3}';
    expect(JSON.parse(extractJsonCandidate(raw)).title).toBe("X");
  });

  it("handles nested braces inside strings", () => {
    const raw = '{"summary":"use {care}","n":1}';
    expect(JSON.parse(extractJsonCandidate(raw)).n).toBe(1);
  });
});
