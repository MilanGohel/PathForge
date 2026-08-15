/**
 * Fail-open product analytics. Never throws; never blocks UX.
 * No PII — callers must not pass emails, note bodies, or lesson markdown.
 */

export type AnalyticsEvent =
  | "path_created"
  | "lesson_ready"
  | "module_completed"
  | "tutor_message";

type Props = Record<string, string | number | boolean | null | undefined>;

export function track(event: AnalyticsEvent, props?: Props): void {
  try {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console -- dev-only trace
      console.info("[analytics]", event, props ?? {});
    }
    if (typeof window !== "undefined") {
      const w = window as Window & {
        pathforgeTrack?: (e: string, p?: Props) => void;
      };
      w.pathforgeTrack?.(event, props);
    }
  } catch {
    // fail open
  }
}
