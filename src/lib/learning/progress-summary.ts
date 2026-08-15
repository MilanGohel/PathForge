/**
 * Pure progress summary for path / stage / dashboard surfaces.
 */

export type ProgressModule = {
  completed_at: string | null;
  est_minutes?: number | null;
};

export type ProgressSummary = {
  done: number;
  total: number;
  /** 0–100 integer; 0 when total is 0 */
  percent: number;
  /** Sum of est_minutes for incomplete modules only */
  remainingMinutes: number;
};

export function presentProgressSummary(
  modules: ProgressModule[],
): ProgressSummary {
  const total = modules.length;
  let done = 0;
  let remainingMinutes = 0;

  for (const m of modules) {
    if (m.completed_at) {
      done += 1;
    } else {
      const mins = m.est_minutes;
      if (typeof mins === "number" && Number.isFinite(mins) && mins > 0) {
        remainingMinutes += mins;
      }
    }
  }

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return { done, total, percent, remainingMinutes };
}
