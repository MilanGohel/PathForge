"use client";

import { useEffect, useState } from "react";
import {
  presentGenerationProgress,
  type GenerationPhase,
  type ProgressFlow,
} from "@/lib/learning/generation-progress";
import {
  expectedMsForFlow,
  presentWaitMessage,
  presentWaitPercent,
  waitMessagesForFlow,
  WAIT_MESSAGE_INTERVAL_MS,
} from "@/lib/learning/wait-progress";
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
  /** Flip true when the underlying job finished so the bar can complete. */
  complete = false,
}: {
  phase: GenerationPhase;
  flow: ProgressFlow;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
  complete?: boolean;
}) {
  const view = presentGenerationProgress({
    phase,
    flow,
    errorMessage,
  });
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [finishing, setFinishing] = useState(false);

  const isError = phase === "error";
  const isWorking = !isError && !phase.endsWith("_ready") && !complete;
  const showSoftWait = isWorking || finishing || complete;

  useEffect(() => {
    if (!showSoftWait && !view.showElapsed) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [showSoftWait, view.showElapsed]);

  // When parent signals complete, hold a brief "fill to 100%" beat
  useEffect(() => {
    if (!complete) {
      setFinishing(false);
      return;
    }
    setFinishing(true);
    const id = window.setTimeout(() => setFinishing(false), 450);
    return () => window.clearTimeout(id);
  }, [complete]);

  const elapsedMs = now - startedAt;
  const messages = waitMessagesForFlow(flow);
  const waitLine = presentWaitMessage({
    messages,
    elapsedMs,
    intervalMs: WAIT_MESSAGE_INTERVAL_MS,
    complete: complete || finishing,
  });
  const percent = presentWaitPercent({
    elapsedMs,
    expectedMs: expectedMsForFlow(flow),
    complete: complete || finishing,
  });

  const headline = view.headline;

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
          {view.showElapsed || showSoftWait ? (
            <p className="mt-0.5 text-xs text-muted">
              Elapsed {formatElapsed(elapsedMs)}
            </p>
          ) : null}
        </div>
      </div>

      {/* Soft progress + rotating messages for long waits */}
      {showSoftWait && !isError ? (
        <div className="space-y-3">
          <div
            className="h-2 overflow-hidden rounded-full bg-background/70"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-start justify-between gap-3">
            <p
              key={waitLine}
              className="min-h-[2.5rem] flex-1 text-sm leading-relaxed text-primary-soft-fg animate-fade-up"
            >
              {waitLine}
            </p>
            <span className="shrink-0 text-xs font-medium tabular-nums text-muted">
              {percent}%
            </span>
          </div>
          <p className="text-xs text-muted">
            Hang tight — good lessons take a moment. You can leave this tab open.
          </p>
        </div>
      ) : null}

      {isError ? (
        <div className="mt-1 space-y-3">
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
      ) : null}
    </div>
  );
}
