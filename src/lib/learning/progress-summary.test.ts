import { describe, expect, it } from "vitest";
import { presentProgressSummary } from "./progress-summary";

describe("presentProgressSummary", () => {
  it("returns zeros for empty list", () => {
    expect(presentProgressSummary([])).toEqual({
      done: 0,
      total: 0,
      percent: 0,
      remainingMinutes: 0,
    });
  });

  it("computes partial progress and remaining minutes", () => {
    const s = presentProgressSummary([
      { completed_at: "x", est_minutes: 10 },
      { completed_at: null, est_minutes: 12 },
      { completed_at: null, est_minutes: 8 },
    ]);
    expect(s).toEqual({
      done: 1,
      total: 3,
      percent: 33,
      remainingMinutes: 20,
    });
  });

  it("handles all complete", () => {
    const s = presentProgressSummary([
      { completed_at: "a", est_minutes: 5 },
      { completed_at: "b", est_minutes: 5 },
    ]);
    expect(s.percent).toBe(100);
    expect(s.remainingMinutes).toBe(0);
    expect(s.done).toBe(2);
  });

  it("ignores null/invalid est minutes on incomplete", () => {
    const s = presentProgressSummary([
      { completed_at: null, est_minutes: null },
      { completed_at: null, est_minutes: -3 },
      { completed_at: null, est_minutes: 5 },
    ]);
    expect(s.remainingMinutes).toBe(5);
    expect(s.percent).toBe(0);
  });
});
