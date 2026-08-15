"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/learning/lesson-toc";
import { cn } from "@/lib/utils";

export function LessonTocNav({
  entries,
  className,
  mobileOnly,
  desktopOnly,
}: {
  entries: TocEntry[];
  className?: string;
  /** Render only the mobile collapsible control */
  mobileOnly?: boolean;
  /** Render only the desktop nav list */
  desktopOnly?: boolean;
}) {
  const [active, setActive] = useState<string | null>(entries[0]?.id ?? null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!entries.length) return;
    const els = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (hits) => {
        const visible = hits
          .filter((h) => h.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    for (const el of els) obs.observe(el);
    return () => obs.disconnect();
  }, [entries]);

  if (!entries.length) return null;

  const links = (
    <ol className="space-y-1 border-l border-border">
      {entries.map((e) => (
        <li key={e.id}>
          <a
            href={`#${e.id}`}
            onClick={() => setOpen(false)}
            className={cn(
              "-ml-px block border-l-2 py-1 pl-3 text-sm transition-colors",
              active === e.id
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {e.title}
          </a>
        </li>
      ))}
    </ol>
  );

  if (desktopOnly) {
    return (
      <nav aria-label="Lesson sections" className={className}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          On this page
        </p>
        {links}
      </nav>
    );
  }

  if (mobileOnly) {
    return (
      <div className={className}>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          On this page
          <span className="text-muted" aria-hidden>
            {open ? "−" : "+"}
          </span>
        </button>
        {open ? (
          <nav
            aria-label="Lesson sections"
            className="mt-2 rounded-xl border border-border bg-card p-4"
          >
            {links}
          </nav>
        ) : null}
      </div>
    );
  }

  // Combined (default): mobile collapsible + desktop sticky list
  return (
    <div className={className}>
      <div className="lg:hidden">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          On this page
          <span className="text-muted" aria-hidden>
            {open ? "−" : "+"}
          </span>
        </button>
        {open ? (
          <nav
            aria-label="Lesson sections"
            className="mt-2 rounded-xl border border-border bg-card p-4"
          >
            {links}
          </nav>
        ) : null}
      </div>
      <nav
        aria-label="Lesson sections"
        className="hidden lg:block"
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          On this page
        </p>
        {links}
      </nav>
    </div>
  );
}
