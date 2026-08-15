"use client";

import { useEffect, useState } from "react";
import {
  presentGenerationProgress,
  type GenerationPhase,
  type ProgressFlow,
} from "@/lib/learning/generation-progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function formatElapsed(ms: number): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

export function GenerationStatus({
  phase,
  flow,
  errorMessage,
  onRetry,
  className,
}: {
  phase: GenerationPhase;
  flow: ProgressFlow;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const view = presentGenerationProgress({
    phase,
    flow,
    errorMessage,
  });
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!view.showElapsed) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [view.showElapsed]);

  const headline = view.headline;
  const isError = phase === "error";

  return (
    <div
      className={cn(
        "rounded-2xl border p-6",
        isError
          ? "border-danger-border bg-danger-bg"
          : "border-primary/25 bg-primary-soft/40",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mb-3 flex items-center gap-3">
        {!isError ? (
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
          </span>
        ) : (
          <span
            className="inline-flex h-3 w-3 shrink-0 rounded-full bg-danger"
            aria-hidden
          />
        )}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-medium",
              isError ? "text-danger-fg" : "text-primary-soft-fg",
            )}
          >
            {headline}
          </p>
          {view.showElapsed ? (
            <p className="mt-0.5 text-xs text-muted">
              Elapsed {formatElapsed(now - startedAt)}
            </p>
          ) : null}
        </div>
      </div>

      <ol className="space-y-2">
        {view.steps.map((step) => (
          <li
            key={step.id}
            className={cn(
              "flex items-start gap-2 text-sm transition-opacity",
              step.state === "active" &&
                "font-medium text-primary-soft-fg opacity-100",
              step.state === "done" && "text-muted opacity-80",
              step.state === "pending" && "text-muted opacity-50",
              step.state === "error" && "font-medium text-danger-fg",
            )}
          >
            <span className="w-4 shrink-0 text-center" aria-hidden>
              {step.state === "done"
                ? "✓"
                : step.state === "active"
                  ? "→"
                  : step.state === "error"
                    ? "!"
                    : "○"}
            </span>
            <span>{step.label}</span>
          </li>
        ))}
      </ol>

      {isError ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-danger-fg">
            {view.errorMessage ??
              errorMessage ??
              "Generation failed. You can try again."}
          </p>
          {onRetry ? (
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted">
          Content is generated once and cached — you won&apos;t pay twice for the
          same module.
        </p>
      )}
    </div>
  );
}
