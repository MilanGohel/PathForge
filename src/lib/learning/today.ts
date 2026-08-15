export type TodayModule = {
  id: string;
  title: string;
  blurb: string;
  estMinutes: number | null;
  stageTitle: string;
  stageId: string;
  pathId: string;
  /** Honest rule explanation for UI */
  reason: string;
  /** start = first touch in path order sense; continue = some prior module done */
  ctaKind: "start" | "continue";
};

export const TODAY_PICK_REASON =
  "First incomplete module in path order" as const;

/**
 * Rule engine: first incomplete module in path order (stage position, then module position).
 */
export function pickTodayModule(
  modules: Array<{
    id: string;
    title: string;
    blurb: string;
    est_minutes: number | null;
    completed_at: string | null;
    position: number;
    stage: {
      id: string;
      title: string;
      position: number;
      path_id: string;
    };
  }>,
): TodayModule | null {
  const sorted = [...modules].sort((a, b) => {
    if (a.stage.position !== b.stage.position) {
      return a.stage.position - b.stage.position;
    }
    return a.position - b.position;
  });
  const next = sorted.find((m) => !m.completed_at);
  if (!next) return null;
  const anyDone = sorted.some((m) => Boolean(m.completed_at));
  return {
    id: next.id,
    title: next.title,
    blurb: next.blurb,
    estMinutes: next.est_minutes,
    stageTitle: next.stage.title,
    stageId: next.stage.id,
    pathId: next.stage.path_id,
    reason: TODAY_PICK_REASON,
    ctaKind: anyDone ? "continue" : "start",
  };
}
