"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  getDiagnosticQuestions,
  submitDiagnosticAndGenerateL0,
} from "@/lib/learning/actions";
import type { DiagnosticQuestion } from "@/types/domain";
import type { GenerationPhase } from "@/lib/learning/generation-progress";
import { Button } from "@/components/ui/button";
import { GenerationStatus } from "./generation-status";

/** In-flight de-dupe across React Strict Mode double-mount in dev */
const inflightByPath = new Map<
  string,
  Promise<Awaited<ReturnType<typeof getDiagnosticQuestions>>>
>();

function loadDiagnosticOnce(pathId: string) {
  const existing = inflightByPath.get(pathId);
  if (existing) return existing;
  const p = getDiagnosticQuestions(pathId).finally(() => {
    setTimeout(() => inflightByPath.delete(pathId), 5_000);
  });
  inflightByPath.set(pathId, p);
  return p;
}

export function DiagnosticForm({ pathId }: { pathId: string }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<DiagnosticQuestion[] | null>(null);
  const [fromPack, setFromPack] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [pending, startTransition] = useTransition();
  /** Product phases for honest progress UI */
  const [genPhase, setGenPhase] = useState<GenerationPhase | "quiz">(
    "diagnostic_loading",
  );
  const [error, setError] = useState<string | null>(null);
  const loadedFor = useRef<string | null>(null);

  async function fetchQuestions() {
    setLoadError(null);
    setError(null);
    setGenPhase("diagnostic_loading");
    const res = await loadDiagnosticOnce(pathId);
    if (!res.ok) {
      setLoadError(res.error);
      setGenPhase("error");
      return false;
    }
    loadedFor.current = pathId;
    setQuestions(res.data.questions);
    setFromPack(res.data.fromPack);
    setGenPhase("quiz");
    return true;
  }

  useEffect(() => {
    let cancelled = false;
    if (loadedFor.current === pathId && questions) return;

    void (async () => {
      const res = await loadDiagnosticOnce(pathId);
      if (cancelled) return;
      if (!res.ok) {
        setLoadError(res.error);
        setGenPhase("error");
        return;
      }
      loadedFor.current = pathId;
      setQuestions(res.data.questions);
      setFromPack(res.data.fromPack);
      setGenPhase("quiz");
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per pathId
  }, [pathId]);

  const allAnswered = useMemo(() => {
    if (!questions?.length) return false;
    return questions.every((q) => answers[q.id] != null);
  }, [questions, answers]);

  function onSubmit() {
    if (!questions) return;
    setError(null);
    // Single server call does score + L0; show the long wait as L0 building.
    setGenPhase("l0_building");
    startTransition(async () => {
      const res = await submitDiagnosticAndGenerateL0({
        pathId,
        questions,
        answers: Object.entries(answers).map(([questionId, choiceIndex]) => ({
          questionId,
          choiceIndex,
        })),
      });
      if (!res.ok) {
        setError(res.error);
        setGenPhase("error");
        return;
      }
      setGenPhase("l0_ready");
      router.push(`/paths/${res.data.pathId}`);
      router.refresh();
    });
  }

  function retryLoad() {
    loadedFor.current = null;
    inflightByPath.delete(pathId);
    void fetchQuestions();
  }

  if (genPhase === "diagnostic_loading") {
    return (
      <GenerationStatus phase="diagnostic_loading" flow="diagnostic_load" />
    );
  }

  if (genPhase === "l0_building" || (pending && genPhase !== "error")) {
    return (
      <GenerationStatus phase="l0_building" flow="diagnostic_submit" />
    );
  }

  if (genPhase === "error" && !questions) {
    return (
      <GenerationStatus
        phase="error"
        flow="diagnostic_load"
        errorMessage={loadError ?? error ?? "Something went wrong."}
        onRetry={retryLoad}
      />
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        {fromPack
          ? "Pack diagnostic — stable placement questions for AI Engineering."
          : "Generated diagnostic — tailored to your topic."}{" "}
        Answer honestly; this shapes stage depth.
      </p>
      <div className="space-y-6">
        {questions?.map((q, qi) => (
          <fieldset
            key={q.id}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <legend className="px-1 text-sm font-medium">
              {qi + 1}. {q.prompt}
            </legend>
            <div className="mt-3 space-y-2">
              {q.choices.map((c, ci) => (
                <label
                  key={ci}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-3 py-2 hover:bg-muted-bg"
                >
                  <input
                    type="radio"
                    name={q.id}
                    className="mt-1 accent-[var(--primary)]"
                    checked={answers[q.id] === ci}
                    onChange={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: ci }))
                    }
                  />
                  <span className="text-sm">{c}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      {genPhase === "error" && questions ? (
        <GenerationStatus
          phase="error"
          flow="diagnostic_submit"
          errorMessage={error ?? "Something went wrong."}
          onRetry={onSubmit}
        />
      ) : (
        <Button disabled={!allAnswered || pending} onClick={onSubmit}>
          Generate my path
        </Button>
      )}
    </div>
  );
}
