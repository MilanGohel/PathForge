/**
 * Pure presenter for daily generation budget soft-warn / block UI.
 */

export type BudgetLevel = "ok" | "warn" | "blocked";

export type BudgetWarningView = {
  level: BudgetLevel;
  used: number;
  limit: number;
  remaining: number;
};

/**
 * @param warnAtRatio — warn when used/limit >= ratio (default 0.8)
 */
export function presentBudgetWarning(input: {
  used: number;
  limit: number;
  warnAtRatio?: number;
}): BudgetWarningView {
  const used = Math.max(0, Math.floor(input.used));
  const limit = Math.max(0, Math.floor(input.limit));
  const remaining = Math.max(0, limit - used);
  const warnAt = input.warnAtRatio ?? 0.8;

  if (limit <= 0) {
    return { level: "blocked", used, limit, remaining: 0 };
  }
  if (used >= limit) {
    return { level: "blocked", used, limit, remaining: 0 };
  }
  if (used / limit >= warnAt) {
    return { level: "warn", used, limit, remaining };
  }
  return { level: "ok", used, limit, remaining };
}
