import { describe, expect, it } from "vitest";
import { presentBudgetWarning } from "./budget-warning";

describe("presentBudgetWarning", () => {
  it("is ok under threshold", () => {
    expect(presentBudgetWarning({ used: 3, limit: 10 })).toEqual({
      level: "ok",
      used: 3,
      limit: 10,
      remaining: 7,
    });
  });

  it("warns at default 80%", () => {
    expect(presentBudgetWarning({ used: 8, limit: 10 }).level).toBe("warn");
    expect(presentBudgetWarning({ used: 8, limit: 10 }).remaining).toBe(2);
  });

  it("blocks at or above limit", () => {
    expect(presentBudgetWarning({ used: 10, limit: 10 }).level).toBe("blocked");
    expect(presentBudgetWarning({ used: 12, limit: 10 }).remaining).toBe(0);
  });

  it("blocks when limit is zero", () => {
    expect(presentBudgetWarning({ used: 0, limit: 0 }).level).toBe("blocked");
  });
});
