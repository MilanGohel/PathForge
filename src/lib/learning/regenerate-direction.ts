/** Max chars accepted for optional L2 regenerate direction. */
export const REGENERATE_DIRECTION_MAX = 280;

/**
 * Normalize optional free-text regenerate direction.
 * Empty / whitespace → undefined.
 */
export function normalizeRegenerateDirection(
  raw: string | null | undefined,
): string | undefined {
  if (raw == null) return undefined;
  const collapsed = raw.replace(/\s+/g, " ").trim();
  if (!collapsed) return undefined;
  if (collapsed.length <= REGENERATE_DIRECTION_MAX) return collapsed;
  return collapsed.slice(0, REGENERATE_DIRECTION_MAX).trimEnd();
}
