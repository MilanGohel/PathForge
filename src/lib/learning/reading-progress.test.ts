import { describe, expect, it } from "vitest";
import {
  buildResumePayload,
  clampScrollRatio,
  parseResumePayload,
  resumeStorageKey,
} from "./reading-progress";

describe("clampScrollRatio", () => {
  it("clamps and handles non-finite", () => {
    expect(clampScrollRatio(-1)).toBe(0);
    expect(clampScrollRatio(0.4)).toBe(0.4);
    expect(clampScrollRatio(2)).toBe(1);
    expect(clampScrollRatio(Number.NaN)).toBe(0);
  });
});

describe("buildResumePayload / parseResumePayload", () => {
  it("round-trips a valid payload", () => {
    const built = buildResumePayload({
      moduleId: "m1",
      headingId: "the-idea",
      scrollRatio: 0.55,
      now: 1000,
    });
    expect(parseResumePayload(built)).toEqual(built);
  });

  it("rejects bad shapes", () => {
    expect(parseResumePayload(null)).toBeNull();
    expect(parseResumePayload({})).toBeNull();
    expect(parseResumePayload({ moduleId: "m", updatedAt: "x" })).toBeNull();
  });

  it("storage key is stable", () => {
    expect(resumeStorageKey("abc")).toBe("pathforge-resume:abc");
  });
});
