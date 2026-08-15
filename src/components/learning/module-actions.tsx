"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { track } from "@/lib/analytics";
import {
  markModuleComplete,
  saveModuleNote,
  submitQuizAnswer,
} from "@/lib/learning/actions";
import { REGENERATE_DIRECTION_MAX } from "@/lib/learning/regenerate-direction";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
          const next = !completed;
          const res = await markModuleComplete(moduleId, next);
          if (res.ok && next) {
            track("module_completed", { moduleId });
          }
          router.refresh();
        });
      }}
    >
      {pending ? "Saving…" : completed ? "Mark incomplete" : "Mark complete"}
    </Button>
  );
}

export function RegenerateModuleButton({ moduleId }: { moduleId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState("");

  async function confirmRegenerate() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/modules/ensure-l2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          regenerate: true,
          direction,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        status?: string;
      };
      if (!res.ok) {
        setError(body.error ?? `Regenerate failed (${res.status})`);
        return;
      }
      // Poll until ready so we stay on this module page
      for (let i = 0; i < 150; i++) {
        const stRes = await fetch(
          `/api/modules/ensure-l2?moduleId=${encodeURIComponent(moduleId)}`,
          { cache: "no-store" },
        );
        const st = (await stRes.json().catch(() => ({}))) as {
          status?: string;
          errorMessage?: string | null;
          error?: string;
        };
        if (st.status === "ready") {
          setOpen(false);
          setDirection("");
          router.refresh();
          return;
        }
        if (st.status === "error") {
          setError(st.errorMessage ?? st.error ?? "Regenerate failed");
          return;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      setError("Regenerate is taking longer than expected. Try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Regenerate failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-stretch gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => {
            if (!open) {
              setOpen(true);
              return;
            }
            void confirmRegenerate();
          }}
        >
          {pending
            ? "Regenerating…"
            : open
              ? "Confirm regenerate"
              : "Regenerate lesson"}
        </Button>
        {open ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => {
              setOpen(false);
              setDirection("");
              setError(null);
            }}
          >
            Cancel
          </Button>
        ) : null}
      </div>
      {open ? (
        <div className="max-w-md space-y-1">
          <label className="text-xs text-muted" htmlFor={`regen-${moduleId}`}>
            Optional direction (e.g. shorter, more examples, more advanced)
          </label>
          <Textarea
            id={`regen-${moduleId}`}
            value={direction}
            maxLength={REGENERATE_DIRECTION_MAX}
            onChange={(e) => setDirection(e.target.value)}
            placeholder="Optional guidance for this regenerate…"
            className="min-h-[64px] text-sm"
            disabled={pending}
          />
        </div>
      ) : null}
      {error ? (
        <p className="text-xs text-danger-fg" role="status">
          {error}
        </p>
      ) : null}
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
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bodyRef = useRef(body);
  const initialRef = useRef(initial);

  useEffect(() => {
    bodyRef.current = body;
  }, [body]);

  useEffect(() => {
    // Sync if server refreshed with newer initial and user hasn't edited
    if (initial !== initialRef.current && body === initialRef.current) {
      setBody(initial);
      initialRef.current = initial;
    }
  }, [initial, body]);

  useEffect(() => {
    if (body === initialRef.current) return;
    setStatus("idle");
    const t = window.setTimeout(() => {
      setStatus("saving");
      setError(null);
      void (async () => {
        const snapshot = bodyRef.current;
        const res = await saveModuleNote(moduleId, snapshot);
        if (res.ok) {
          initialRef.current = snapshot;
          setStatus("saved");
          setSavedAt(new Date());
        } else {
          setStatus("error");
          setError(res.error);
        }
      })();
    }, 600);
    return () => window.clearTimeout(t);
  }, [body, moduleId]);

  // Flush pending edits on unmount / navigation
  useEffect(() => {
    return () => {
      const snapshot = bodyRef.current;
      if (snapshot !== initialRef.current) {
        void saveModuleNote(moduleId, snapshot);
      }
    };
  }, [moduleId]);

  return (
    <div className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Your notes for this module…"
        aria-label="Module notes"
      />
      <p className="text-xs text-muted" role="status" aria-live="polite">
        {status === "saving"
          ? "Saving…"
          : status === "error"
            ? error ?? "Couldn’t save"
            : status === "saved" && savedAt
              ? `Saved ${savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : body === initialRef.current
                ? "Autosave on"
                : "Unsaved changes…"}
      </p>
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

  const answered = Object.keys(results).length;
  const correct = Object.values(results).filter((r) => r.isCorrect).length;
  const allDone = answered === items.length && items.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold tracking-tight">Optional check</h3>
        <p className="text-sm text-muted">
          Practice only — you can mark the module complete without this.
        </p>
      </div>
      {items.map((item) => {
        const result = results[item.id];
        return (
          <div
            key={item.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="mb-3 text-sm font-medium">{item.prompt}</p>
            <div className="space-y-2" role="group" aria-label={item.prompt}>
              {item.choices.map((c, i) => {
                const selected = result?.choice === i;
                const showCorrect = result && result.isCorrect && selected;
                const showWrong = result && !result.isCorrect && selected;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!!result || pendingId === item.id}
                    className={cn(
                      "block w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected
                        ? showCorrect
                          ? "border-success bg-success-bg text-success-fg"
                          : showWrong
                            ? "border-warning-border bg-warning-bg text-warning-fg"
                            : "border-primary bg-primary-soft/40"
                        : "border-border hover:bg-muted-bg",
                      !!result && !selected && "opacity-60",
                    )}
                    onClick={async () => {
                      if (result || pendingId) return;
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
                );
              })}
            </div>
            {result ? (
              <p
                className={cn(
                  "mt-3 text-sm",
                  result.isCorrect ? "text-primary" : "text-warning-fg",
                )}
                role="status"
              >
                {result.isCorrect ? "Correct. " : "Not quite. "}
                {result.explanation}
              </p>
            ) : null}
          </div>
        );
      })}
      {allDone ? (
        <p className="text-sm font-medium text-foreground" role="status">
          Score: {correct}/{items.length}
        </p>
      ) : answered > 0 ? (
        <p className="text-xs text-muted">
          Answered {answered}/{items.length}
        </p>
      ) : null}
    </div>
  );
}
