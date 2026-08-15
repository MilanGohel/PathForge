/**
 * Soft wait-progress helpers for long generation screens.
 * Pure: no timers. UI owns elapsed ms and complete flag.
 */

import type { ProgressFlow } from "./generation-progress";

/** Rotating copy while a long generation runs (order is intentional). */
export const L2_WAIT_MESSAGES = [
  "Sketching a clear outline for this module…",
  "Choosing section titles that fit the topic…",
  "Writing the core idea in plain language…",
  "Adding a worked example you can follow…",
  "Calling out a common mistake to avoid…",
  "Drafting a small practice step…",
  "Checking the lesson stands on its own…",
  "Almost there — packing the last sections…",
] as const;

export const L1_WAIT_MESSAGES = [
  "Breaking this stage into sensible modules…",
  "Ordering modules so each builds on the last…",
  "Writing short blurbs for each sitting…",
  "Estimating time so the stage feels realistic…",
  "Almost there — finishing the module list…",
] as const;

export const L0_WAIT_MESSAGES = [
  "Reading your goal and placement…",
  "Shaping stages around what you already know…",
  "Ordering the journey from foundations to depth…",
  "Writing stage summaries you can scan…",
  "Almost there — locking the path outline…",
] as const;

export const DIAGNOSTIC_WAIT_MESSAGES = [
  "Loading questions matched to your topic…",
  "Preparing a short placement check…",
] as const;

const DEFAULT_MESSAGES = ["Working on it…"] as const;

/** How long (ms) each rotating message stays before the next. */
export const WAIT_MESSAGE_INTERVAL_MS = 4200;

/**
 * Soft asymptotic progress 0–1 while waiting.
 * Approaches ~0.92 over ~expectedMs, never hits 1 until `complete`.
 */
export function presentSoftProgress(input: {
  elapsedMs: number;
  /** Typical wait used to shape the curve (not a hard cap). */
  expectedMs?: number;
  complete?: boolean;
}): number {
  if (input.complete) return 1;
  const expected = Math.max(5_000, input.expectedMs ?? 45_000);
  const t = Math.max(0, input.elapsedMs) / expected;
  // 1 - e^(-k t) with k≈2.4 → ~0.9 around expectedMs
  const soft = 1 - Math.exp(-2.4 * t);
  // Cap under 1 so the bar only finishes when complete flips
  return Math.min(0.92, Math.max(0, soft));
}

export function presentWaitPercent(input: {
  elapsedMs: number;
  expectedMs?: number;
  complete?: boolean;
}): number {
  return Math.round(presentSoftProgress(input) * 100);
}

export function waitMessagesForFlow(flow: ProgressFlow): readonly string[] {
  switch (flow) {
    case "l2":
      return L2_WAIT_MESSAGES;
    case "l1":
      return L1_WAIT_MESSAGES;
    case "diagnostic_submit":
      return L0_WAIT_MESSAGES;
    case "diagnostic_load":
      return DIAGNOSTIC_WAIT_MESSAGES;
    default:
      return DEFAULT_MESSAGES;
  }
}

/**
 * Pick which rotating message to show for elapsed time.
 * Deterministic for tests.
 */
export function presentWaitMessage(input: {
  messages: readonly string[];
  elapsedMs: number;
  intervalMs?: number;
  complete?: boolean;
  completeMessage?: string;
}): string {
  const messages = input.messages.length ? input.messages : DEFAULT_MESSAGES;
  if (input.complete) {
    return input.completeMessage ?? "Done — opening your content…";
  }
  const interval = Math.max(500, input.intervalMs ?? WAIT_MESSAGE_INTERVAL_MS);
  const idx = Math.floor(Math.max(0, input.elapsedMs) / interval) % messages.length;
  return messages[idx] ?? messages[0]!;
}

/** Default expected durations used only to shape the soft bar. */
export function expectedMsForFlow(flow: ProgressFlow): number {
  switch (flow) {
    case "l2":
      return 55_000;
    case "l1":
      return 35_000;
    case "diagnostic_submit":
      return 40_000;
    case "diagnostic_load":
      return 8_000;
    default:
      return 30_000;
  }
}
