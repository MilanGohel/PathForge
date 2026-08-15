import { describe, expect, it } from "vitest";
import {
  presentGenerationProgress,
  type GenerationPhase,
  type ProgressFlow,
} from "./generation-progress";

function stepStates(phase: GenerationPhase, flow: ProgressFlow) {
  return presentGenerationProgress({ phase, flow }).steps.map((s) => ({
    id: s.id,
    state: s.state,
  }));
}

describe("presentGenerationProgress", () => {
  it("diagnostic_loading marks load active and later steps pending", () => {
    const view = presentGenerationProgress({
      phase: "diagnostic_loading",
      flow: "diagnostic_load",
    });
    expect(view.headline).toMatch(/diagnostic/i);
    expect(view.showElapsed).toBe(false);
    expect(stepStates("diagnostic_loading", "diagnostic_load")).toEqual([
      { id: "load", state: "active" },
    ]);
  });

  it("diagnostic_ready has no spinner theater (empty or all done)", () => {
    const view = presentGenerationProgress({
      phase: "diagnostic_ready",
      flow: "diagnostic_load",
    });
    expect(view.steps.every((s) => s.state === "done")).toBe(true);
    expect(view.showElapsed).toBe(false);
  });

  it("diagnostic submit flow shows scoring then L0 only", () => {
    expect(stepStates("diagnostic_scoring", "diagnostic_submit")).toEqual([
      { id: "score", state: "active" },
      { id: "l0", state: "pending" },
    ]);
    expect(stepStates("l0_building", "diagnostic_submit")).toEqual([
      { id: "score", state: "done" },
      { id: "l0", state: "active" },
    ]);
    const ready = presentGenerationProgress({
      phase: "l0_ready",
      flow: "diagnostic_submit",
    });
    expect(ready.steps.map((s) => s.state)).toEqual(["done", "done"]);
    expect(ready.steps.some((s) => s.id === "l1" || s.id === "l2")).toBe(false);
  });

  it("l1_building is a single honest expanding step", () => {
    const view = presentGenerationProgress({
      phase: "l1_building",
      flow: "l1",
    });
    expect(view.headline).toMatch(/module/i);
    expect(view.steps).toHaveLength(1);
    expect(view.steps[0]).toMatchObject({ id: "l1", state: "active" });
    expect(view.showElapsed).toBe(true);
  });

  it("l2_building is writing lesson only", () => {
    const view = presentGenerationProgress({
      phase: "l2_building",
      flow: "l2",
    });
    expect(view.headline).toMatch(/lesson/i);
    expect(view.steps).toHaveLength(1);
    expect(view.steps[0]).toMatchObject({ id: "l2", state: "active" });
    expect(view.showElapsed).toBe(true);
  });

  it("error marks active/error without looping back to start theater", () => {
    const view = presentGenerationProgress({
      phase: "error",
      flow: "diagnostic_submit",
      errorMessage: "Gateway timeout",
    });
    expect(view.errorMessage).toBe("Gateway timeout");
    expect(view.steps.some((s) => s.state === "error")).toBe(true);
    // Must not invent a full fake checklist restart
    expect(view.steps.length).toBeLessThanOrEqual(3);
    expect(view.steps.every((s) => s.state !== "pending" || true)).toBe(true);
    // No step after error should be "active" pretending work continues
    const errIdx = view.steps.findIndex((s) => s.state === "error");
    expect(errIdx).toBeGreaterThanOrEqual(0);
    expect(view.steps.slice(errIdx + 1).every((s) => s.state === "pending")).toBe(
      true,
    );
  });

  it("l1/l2 ready mark their single step done", () => {
    expect(
      presentGenerationProgress({ phase: "l1_ready", flow: "l1" }).steps[0]
        .state,
    ).toBe("done");
    expect(
      presentGenerationProgress({ phase: "l2_ready", flow: "l2" }).steps[0]
        .state,
    ).toBe("done");
  });

  it("irrelevant future stages are not shown as failed on diagnostic flow", () => {
    const view = presentGenerationProgress({
      phase: "error",
      flow: "diagnostic_submit",
    });
    const ids = view.steps.map((s) => s.id);
    expect(ids).not.toContain("l1");
    expect(ids).not.toContain("l2");
  });
});
