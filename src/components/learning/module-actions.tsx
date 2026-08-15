"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ensureModuleL2,
  markModuleComplete,
  saveModuleNote,
  submitQuizAnswer,
} from "@/lib/learning/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CompleteButton({
  moduleId,
  completed,
}: {
  moduleId: string;
  completed: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={completed ? "secondary" : "default"}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await markModuleComplete(moduleId, !completed);
          router.refresh();
        });
      }}
    >
      {completed ? "Mark incomplete" : "Mark complete"}
    </Button>
  );
}

export function RegenerateModuleButton({ moduleId }: { moduleId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="inline-flex flex-col items-stretch gap-1">
      <Button
        variant="outline"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await ensureModuleL2(moduleId, { regenerate: true });
            if (!res.ok) setError(res.error);
            router.refresh();
          });
        }}
      >
        {pending ? "Regenerating…" : "Regenerate lesson"}
      </Button>
      {error ? <p className="text-xs text-danger-fg">{error}</p> : null}
    </div>
  );
}

export function NotesEditor({
  moduleId,
  initial,
}: {
  moduleId: string;
  initial: string;
}) {
  const [body, setBody] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          setSaved(false);
        }}
        placeholder="Your notes for this module…"
      />
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await saveModuleNote(moduleId, body);
            setSaved(true);
          });
        }}
      >
        {pending ? "Saving…" : saved ? "Saved" : "Save notes"}
      </Button>
    </div>
  );
}

export function QuizBlock({
  items,
}: {
  items: Array<{
    id: string;
    prompt: string;
    choices: string[];
  }>;
}) {
  const [results, setResults] = useState<
    Record<string, { isCorrect: boolean; explanation: string; choice: number }>
  >({});
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (!items.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold tracking-tight">Optional check</h3>
      <p className="text-sm text-muted">
        Practice only — you can mark the module complete without this.
      </p>
      {items.map((item) => {
        const result = results[item.id];
        return (
          <div
            key={item.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="mb-3 text-sm font-medium">{item.prompt}</p>
            <div className="space-y-2">
              {item.choices.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={!!result || pendingId === item.id}
                  className="block w-full rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-muted-bg disabled:opacity-70"
                  onClick={async () => {
                    setPendingId(item.id);
                    const res = await submitQuizAnswer({
                      quizItemId: item.id,
                      choiceIndex: i,
                    });
                    setPendingId(null);
                    if (res.ok) {
                      setResults((prev) => ({
                        ...prev,
                        [item.id]: {
                          isCorrect: res.data.isCorrect,
                          explanation: res.data.explanation,
                          choice: i,
                        },
                      }));
                    }
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            {result ? (
              <p
                className={`mt-3 text-sm ${result.isCorrect ? "text-primary" : "text-warning-fg"}`}
              >
                {result.isCorrect ? "Correct. " : "Not quite. "}
                {result.explanation}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
