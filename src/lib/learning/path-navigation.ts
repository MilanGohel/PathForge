/**
 * Pure path navigation presenter.
 * Orders modules by stage position then module position.
 */

export type NavModule = {
  id: string;
  title: string;
  position: number;
  completed_at: string | null;
  stage: {
    id: string;
    title: string;
    position: number;
  };
};

export type NavTarget = {
  id: string;
  title: string;
  stageId: string;
  stageTitle: string;
};

export type PathNavigation = {
  prev: NavTarget | null;
  next: NavTarget | null;
  /** Next incomplete in path order (for post-complete continue). */
  nextIncomplete: NavTarget | null;
  index: number; // 0-based; -1 if current unknown
  total: number;
  pathComplete: boolean;
};

function toTarget(m: NavModule): NavTarget {
  return {
    id: m.id,
    title: m.title,
    stageId: m.stage.id,
    stageTitle: m.stage.title,
  };
}

export function sortPathModules(modules: NavModule[]): NavModule[] {
  return [...modules].sort((a, b) => {
    if (a.stage.position !== b.stage.position) {
      return a.stage.position - b.stage.position;
    }
    return a.position - b.position;
  });
}

/**
 * Present prev/next and continue targets for the open module.
 */
export function presentPathNavigation(
  modules: NavModule[],
  currentModuleId: string,
): PathNavigation {
  const sorted = sortPathModules(modules);
  const total = sorted.length;
  const index = sorted.findIndex((m) => m.id === currentModuleId);
  const pathComplete =
    total > 0 && sorted.every((m) => Boolean(m.completed_at));

  const nextIncompleteMod = sorted.find((m) => !m.completed_at) ?? null;

  if (index < 0) {
    return {
      prev: null,
      next: null,
      nextIncomplete: nextIncompleteMod ? toTarget(nextIncompleteMod) : null,
      index: -1,
      total,
      pathComplete,
    };
  }

  const prevMod = index > 0 ? sorted[index - 1]! : null;
  const nextMod = index < total - 1 ? sorted[index + 1]! : null;

  // Continue target: first incomplete that isn't the current module when possible
  let continueMod = sorted.find(
    (m) => !m.completed_at && m.id !== currentModuleId,
  );
  if (!continueMod && !sorted[index]!.completed_at) {
    continueMod = sorted[index]!;
  }

  return {
    prev: prevMod ? toTarget(prevMod) : null,
    next: nextMod ? toTarget(nextMod) : null,
    nextIncomplete: continueMod ? toTarget(continueMod) : null,
    index,
    total,
    pathComplete,
  };
}
