"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  getDiagnosticQuestions,
  submitDiagnosticAndGenerateL0,
} from "@/lib/learning/actions";
import type { DiagnosticQuestion } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { GenerationStatus } from "./generation-status";

export function DiagnosticForm({ pathId }: { pathId: string }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<DiagnosticQuestion[] | null>(null);
  const [fromPack, setFromPack] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [pending, startTransition] = useTransition();
  const [phase, setPhase] = useState<"load" | "quiz" | "generating" | "error">(
    "load",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getDiagnosticQuestions(pathId);
      if (cancelled) return;
      if (!res.ok) {
        setLoadError(res.error);
        setPhase("error");
        return;
      }
      setQuestions(res.data.questions);
      setFromPack(res.data.fromPack);
      setPhase("quiz");
    })();
    return () => {
      cancelled = true;
    };
  }, [pathId]);

  const allAnswered = useMemo(() => {
    if (!questions?.length) return false;
    return questions.every((q) => answers[q.id] != null);
  }, [questions, answers]);

  function onSubmit() {
    if (!questions) return;
    setError(null);
    setPhase("generating");
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
        setPhase("error");
        return;
      }
      router.push(`/paths/${res.data.pathId}`);
      router.refresh();
    });
  }

  if (phase === "load") {
    return <GenerationStatus label="Preparing your diagnostic…" />;
  }

  if (phase === "generating" || pending) {
    return (
      <GenerationStatus label="Building your personalized path outline (L0)…" />
    );
  }

  if (phase === "error" && !questions) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
        {loadError ?? error ?? "Something went wrong."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-500">
        {fromPack
          ? "Pack diagnostic — stable placement questions for AI Engineering."
          : "Generated diagnostic — tailored to your topic."}{" "}
        Answer honestly; this shapes stage depth.
      </p>
      <div className="space-y-6">
        {questions?.map((q, qi) => (
          <fieldset
            key={q.id}
            className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <legend className="px-1 text-sm font-medium">
              {qi + 1}. {q.prompt}
            </legend>
            <div className="mt-3 space-y-2">
              {q.choices.map((c, ci) => (
                <label
                  key={ci}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <input
                    type="radio"
                    name={q.id}
                    className="mt-1"
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
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      <Button disabled={!allAnswered || pending} onClick={onSubmit}>
        Generate my path
      </Button>
    </div>
  );
}
