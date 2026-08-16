import { Check, CircleDot, Lock, MessagesSquare } from "lucide-react";

const stages = [
  {
    name: "Stage 1 · Foundations of LLM apps",
    modules: [
      { title: "How models actually read your prompt", state: "done" as const },
      { title: "Tokens, cost, and latency tradeoffs", state: "done" as const },
      { title: "Why context windows matter", state: "current" as const },
    ],
  },
  {
    name: "Stage 2 · Retrieval that works",
    modules: [
      {
        title: "Chunking documents without losing meaning",
        state: "locked" as const,
      },
      { title: "Evaluating retrieval quality", state: "locked" as const },
    ],
  },
];

const lessonSections = [
  "Why context windows bite",
  "The sliding window model",
  "A truncation walkthrough",
  "Practice: budget a 32k window",
];

/** Static product mock for the marketing landing — not live data. */
export function PathMock() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-md"
      style={{ boxShadow: "var(--shadow-md)" }}
      aria-hidden
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex gap-1.5">
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
          </span>
          <p className="truncate text-sm font-medium">
            AI engineering, from scratch
          </p>
        </div>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-medium text-primary-soft-fg">
          2 of 5 modules
        </span>
      </div>

      <div className="grid divide-border sm:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] sm:divide-x">
        <div className="p-5">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted">
            Your path
          </p>
          <div className="mt-4 space-y-5">
            {stages.map((stage) => (
              <div key={stage.name}>
                <p className="text-xs font-medium text-muted">{stage.name}</p>
                <ul className="mt-2 space-y-1.5">
                  {stage.modules.map((m) => (
                    <li
                      key={m.title}
                      className={
                        m.state === "current"
                          ? "flex items-center gap-2.5 rounded-xl border border-primary/40 bg-primary-soft px-3 py-2.5 text-[13px] leading-snug text-primary-soft-fg"
                          : "flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5 text-[13px] leading-snug"
                      }
                    >
                      {m.state === "done" ? (
                        <Check
                          className="size-4 shrink-0 text-primary"
                          aria-hidden
                        />
                      ) : m.state === "current" ? (
                        <CircleDot
                          className="size-4 shrink-0 text-primary"
                          aria-hidden
                        />
                      ) : (
                        <Lock
                          className="size-4 shrink-0 text-muted"
                          aria-hidden
                        />
                      )}
                      <span
                        className={
                          m.state === "locked" ? "text-muted" : "font-medium"
                        }
                      >
                        {m.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border p-5 sm:border-t-0">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted">
            Current module
          </p>
          <h3 className="mt-2 text-base font-semibold">
            Why context windows matter
          </h3>
          <ol className="mt-4 space-y-2 text-[13px]">
            {lessonSections.map((section, i) => (
              <li key={section} className="flex items-start gap-3">
                <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-md bg-muted-bg text-[11px] font-semibold text-foreground">
                  {i + 1}
                </span>
                <span className={i === 0 ? "font-medium" : "text-muted"}>
                  {section}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-5 rounded-xl border border-border bg-background p-3">
            <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-muted">
              <MessagesSquare className="size-3.5" aria-hidden />
              Module tutor
            </p>
            <p className="mt-2 text-[13px] leading-snug">
              “Show me what gets dropped when the conversation passes the
              limit.”
            </p>
            <p className="mt-2 rounded-lg bg-primary-soft px-3 py-2 text-[13px] leading-snug text-primary-soft-fg">
              The oldest turns fall out first — let&apos;s trace one 8k example
              line by line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
