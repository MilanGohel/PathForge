import { describe, expect, it } from "vitest";
import {
  normalizeRegenerateDirection,
  REGENERATE_DIRECTION_MAX,
} from "./regenerate-direction";

describe("normalizeRegenerateDirection", () => {
  it("returns undefined for empty/whitespace", () => {
    expect(normalizeRegenerateDirection(undefined)).toBeUndefined();
    expect(normalizeRegenerateDirection(null)).toBeUndefined();
    expect(normalizeRegenerateDirection("")).toBeUndefined();
    expect(normalizeRegenerateDirection("   \n\t ")).toBeUndefined();
  });

  it("trims and collapses whitespace", () => {
    expect(normalizeRegenerateDirection("  more   examples\nplease  ")).toBe(
      "more examples please",
    );
  });

  it("truncates to max length", () => {
    const long = "x".repeat(REGENERATE_DIRECTION_MAX + 40);
    const out = normalizeRegenerateDirection(long);
    expect(out?.length).toBe(REGENERATE_DIRECTION_MAX);
  });
});
