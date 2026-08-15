/**
 * Pure generation-progress presenter.
 * Maps discrete product phases → ordered UI steps. No timers, no fake loops.
 */

export type GenerationPhase =
  | "diagnostic_loading"
  | "diagnostic_ready"
  | "diagnostic_scoring"
  | "l0_building"
  | "l0_ready"
  | "l1_building"
  | "l1_ready"
  | "l2_building"
  | "l2_ready"
  | "error";

export type ProgressFlow =
  | "diagnostic_load"
  | "diagnostic_submit"
  | "l1"
  | "l2";

export type StepState = "pending" | "active" | "done" | "error";

export type ProgressStep = {
  id: string;
  label: string;
  state: StepState;
};

export type GenerationProgressView = {
  headline: string;
  steps: ProgressStep[];
  showElapsed: boolean;
  errorMessage?: string;
};

type StepDef = { id: string; label: string };

const FLOW_STEPS: Record<ProgressFlow, StepDef[]> = {
  diagnostic_load: [{ id: "load", label: "Loading diagnostic questions" }],
  diagnostic_submit: [
    { id: "score", label: "Scoring your answers" },
    { id: "l0", label: "Building your path outline" },
  ],
  l1: [{ id: "l1", label: "Expanding stage into modules" }],
  l2: [{ id: "l2", label: "Writing your lesson" }],
};

/** Which step id is active (or done-through) for a phase within a flow. */
function activeStepId(
  phase: GenerationPhase,
  flow: ProgressFlow,
): string | "all_done" | "none" | "error" {
  if (phase === "error") return "error";

  switch (flow) {
    case "diagnostic_load":
      if (phase === "diagnostic_loading") return "load";
      if (phase === "diagnostic_ready") return "all_done";
      return "none";
    case "diagnostic_submit":
      if (phase === "diagnostic_scoring") return "score";
      if (phase === "l0_building") return "l0";
      if (phase === "l0_ready") return "all_done";
      return "none";
    case "l1":
      if (phase === "l1_building") return "l1";
      if (phase === "l1_ready") return "all_done";
      return "none";
    case "l2":
      if (phase === "l2_building") return "l2";
      if (phase === "l2_ready") return "all_done";
      return "none";
  }
}

function headlineFor(
  phase: GenerationPhase,
  flow: ProgressFlow,
  errorMessage?: string,
): string {
  if (phase === "error") {
    return errorMessage?.trim()
      ? "Something went wrong"
      : "Generation failed";
  }
  switch (flow) {
    case "diagnostic_load":
      return phase === "diagnostic_ready"
        ? "Diagnostic ready"
        : "Preparing your diagnostic";
    case "diagnostic_submit":
      if (phase === "diagnostic_scoring") return "Scoring your diagnostic";
      if (phase === "l0_ready") return "Path outline ready";
      return "Building your personalized path";
    case "l1":
      return phase === "l1_ready"
        ? "Modules ready"
        : "Expanding stage into modules";
    case "l2":
      return phase === "l2_ready" ? "Lesson ready" : "Writing your lesson";
  }
}

function showElapsedFor(phase: GenerationPhase, flow: ProgressFlow): boolean {
  if (phase === "error" || phase.endsWith("_ready")) return false;
  // Long Gateway calls: L0/L1/L2 building (and scoring can be quick)
  if (flow === "l1" && phase === "l1_building") return true;
  if (flow === "l2" && phase === "l2_building") return true;
  if (flow === "diagnostic_submit" && phase === "l0_building") return true;
  return false;
}

/**
 * Present honest progress for a generation flow.
 * Never invents a looping checklist — only steps relevant to `flow`.
 */
export function presentGenerationProgress(input: {
  phase: GenerationPhase;
  flow: ProgressFlow;
  errorMessage?: string;
}): GenerationProgressView {
  const { phase, flow, errorMessage } = input;
  const defs = FLOW_STEPS[flow];
  const focus = activeStepId(phase, flow);

  let steps: ProgressStep[];

  if (focus === "error") {
    // Mark the first non-done-looking step as error; keep later steps pending.
    // Prefer the step that would have been active for a "building" attempt.
    const errTarget =
      flow === "diagnostic_submit"
        ? "l0"
        : flow === "diagnostic_load"
          ? "load"
          : flow === "l1"
            ? "l1"
            : "l2";
    const errIdx = Math.max(
      0,
      defs.findIndex((d) => d.id === errTarget),
    );
    steps = defs.map((d, i) => {
      if (i < errIdx) return { ...d, state: "done" as const };
      if (i === errIdx) return { ...d, state: "error" as const };
      return { ...d, state: "pending" as const };
    });
  } else if (focus === "all_done") {
    steps = defs.map((d) => ({ ...d, state: "done" as const }));
  } else if (focus === "none") {
    steps = defs.map((d) => ({ ...d, state: "pending" as const }));
  } else {
    const activeIdx = defs.findIndex((d) => d.id === focus);
    steps = defs.map((d, i) => {
      if (i < activeIdx) return { ...d, state: "done" as const };
      if (i === activeIdx) return { ...d, state: "active" as const };
      return { ...d, state: "pending" as const };
    });
  }

  return {
    headline: headlineFor(phase, flow, errorMessage),
    steps,
    showElapsed: showElapsedFor(phase, flow),
    ...(errorMessage ? { errorMessage } : {}),
  };
}
