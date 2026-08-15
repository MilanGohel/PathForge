/**
 * Pure helpers for lesson reading progress + client resume payload.
 */

export type ResumePayload = {
  moduleId: string;
  headingId?: string;
  scrollRatio?: number;
  updatedAt: number;
};

export function clampScrollRatio(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function buildResumePayload(input: {
  moduleId: string;
  headingId?: string | null;
  scrollRatio?: number | null;
  now?: number;
}): ResumePayload {
  const payload: ResumePayload = {
    moduleId: input.moduleId,
    updatedAt: input.now ?? 0,
  };
  if (input.headingId) payload.headingId = input.headingId;
  if (input.scrollRatio != null) {
    payload.scrollRatio = clampScrollRatio(input.scrollRatio);
  }
  return payload;
}

export function parseResumePayload(raw: unknown): ResumePayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.moduleId !== "string" || !o.moduleId.trim()) return null;
  if (typeof o.updatedAt !== "number" || !Number.isFinite(o.updatedAt)) {
    return null;
  }
  const payload: ResumePayload = {
    moduleId: o.moduleId,
    updatedAt: o.updatedAt,
  };
  if (typeof o.headingId === "string" && o.headingId) {
    payload.headingId = o.headingId;
  }
  if (typeof o.scrollRatio === "number") {
    payload.scrollRatio = clampScrollRatio(o.scrollRatio);
  }
  return payload;
}

export const RESUME_STORAGE_PREFIX = "pathforge-resume:";

export function resumeStorageKey(moduleId: string): string {
  return `${RESUME_STORAGE_PREFIX}${moduleId}`;
}
