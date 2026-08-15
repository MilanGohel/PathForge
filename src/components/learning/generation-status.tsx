"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Planning curriculum structure",
  "Personalizing for your level",
  "Writing content",
  "Finding resources",
  "Saving to your path",
] as const;

export function GenerationStatus({
  label = "Generating",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        "rounded-2xl border border-teal-200 bg-teal-50/60 p-6 dark:border-teal-900 dark:bg-teal-950/30",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-500" />
        </span>
        <p className="font-medium text-teal-900 dark:text-teal-100">{label}</p>
      </div>
      <ol className="space-y-2">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={cn(
              "text-sm transition-opacity",
              i === step
                ? "font-medium text-teal-800 opacity-100 dark:text-teal-200"
                : i < step
                  ? "text-teal-700/70 opacity-70 dark:text-teal-300/70"
                  : "text-zinc-400 opacity-50",
            )}
          >
            {i < step ? "✓ " : i === step ? "→ " : "○ "}
            {s}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-zinc-500">
        This can take a bit — content is streamed from the model and cached so
        you never pay twice for the same module.
      </p>
    </div>
  );
}
