export type TodayModule = {
  id: string;
  title: string;
  blurb: string;
  estMinutes: number | null;
  stageTitle: string;
  stageId: string;
  pathId: string;
};

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
  return {
    id: next.id,
    title: next.title,
    blurb: next.blurb,
    estMinutes: next.est_minutes,
    stageTitle: next.stage.title,
    stageId: next.stage.id,
    pathId: next.stage.path_id,
  };
}
