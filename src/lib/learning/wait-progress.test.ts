import { describe, expect, it } from "vitest";
import {
  L2_WAIT_MESSAGES,
  presentSoftProgress,
  presentWaitMessage,
  presentWaitPercent,
  waitMessagesForFlow,
  WAIT_MESSAGE_INTERVAL_MS,
} from "./wait-progress";

describe("presentSoftProgress", () => {
  it("starts near zero", () => {
    expect(presentSoftProgress({ elapsedMs: 0 })).toBeLessThan(0.05);
  });

  it("increases with elapsed time but stays under 1 while incomplete", () => {
    const a = presentSoftProgress({ elapsedMs: 5_000, expectedMs: 40_000 });
    const b = presentSoftProgress({ elapsedMs: 20_000, expectedMs: 40_000 });
    const c = presentSoftProgress({ elapsedMs: 120_000, expectedMs: 40_000 });
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
    expect(c).toBeLessThan(1);
    expect(c).toBeLessThanOrEqual(0.92);
  });

  it("snaps to 1 when complete", () => {
    expect(
      presentSoftProgress({ elapsedMs: 100, expectedMs: 40_000, complete: true }),
    ).toBe(1);
  });
});

describe("presentWaitPercent", () => {
  it("returns 100 when complete", () => {
    expect(presentWaitPercent({ elapsedMs: 0, complete: true })).toBe(100);
  });

  it("returns an integer 0–92 while waiting", () => {
    const p = presentWaitPercent({ elapsedMs: 10_000, expectedMs: 50_000 });
    expect(Number.isInteger(p)).toBe(true);
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(92);
  });
});

describe("presentWaitMessage", () => {
  it("rotates through messages by interval", () => {
    const messages = ["A", "B", "C"] as const;
    expect(
      presentWaitMessage({ messages, elapsedMs: 0, intervalMs: 1000 }),
    ).toBe("A");
    expect(
      presentWaitMessage({ messages, elapsedMs: 1000, intervalMs: 1000 }),
    ).toBe("B");
    expect(
      presentWaitMessage({ messages, elapsedMs: 2500, intervalMs: 1000 }),
    ).toBe("C");
    expect(
      presentWaitMessage({ messages, elapsedMs: 3000, intervalMs: 1000 }),
    ).toBe("A");
  });

  it("shows complete message when done", () => {
    expect(
      presentWaitMessage({
        messages: L2_WAIT_MESSAGES,
        elapsedMs: 9999,
        complete: true,
      }),
    ).toMatch(/done|opening/i);
  });

  it("uses default L2 message list for l2 flow", () => {
    expect(waitMessagesForFlow("l2")).toEqual(L2_WAIT_MESSAGES);
    expect(WAIT_MESSAGE_INTERVAL_MS).toBeGreaterThan(1000);
  });
});
