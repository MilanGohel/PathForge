"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  buildResumePayload,
  clampScrollRatio,
  parseResumePayload,
  resumeStorageKey,
} from "@/lib/learning/reading-progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FOCUS_KEY = "pathforge-focus-mode";

export function ReadingProgressBar({ targetId }: { targetId: string }) {
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;

    function onScroll() {
      const node = document.getElementById(targetId);
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const total = node.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setRatio(rect.bottom <= window.innerHeight ? 1 : 0);
        return;
      }
      const scrolled = window.scrollY + window.innerHeight - (node.offsetTop || 0);
      // Prefer document scroll relative to article top
      const top = node.getBoundingClientRect().top + window.scrollY;
      const y = window.scrollY - top;
      setRatio(clampScrollRatio(y / Math.max(1, node.scrollHeight - window.innerHeight * 0.5)));
      void scrolled;
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetId]);

  return (
    <div
      className="pointer-events-none fixed top-14 right-0 left-0 z-30 h-0.5 bg-transparent"
      aria-hidden
    >
      <div
        className="h-full bg-primary transition-[width] duration-150"
        style={{ width: `${Math.round(ratio * 100)}%` }}
      />
    </div>
  );
}

export function useFocusMode() {
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    try {
      setFocus(localStorage.getItem(FOCUS_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setFocus((f) => {
      const next = !f;
      try {
        localStorage.setItem(FOCUS_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { focus, toggle };
}

export function FocusModeToggle({
  focus,
  onToggle,
}: {
  focus: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={focus ? "default" : "outline"}
      onClick={onToggle}
      aria-pressed={focus}
    >
      {focus ? "Exit focus" : "Focus mode"}
    </Button>
  );
}

/** Persist + restore scroll/heading for a module lesson (client-only). */
export function ResumeReading({
  moduleId,
  tocIds,
  children,
}: {
  moduleId: string;
  tocIds: string[];
  children: ReactNode;
}) {
  useEffect(() => {
    const key = resumeStorageKey(moduleId);
    let restored = false;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const payload = parseResumePayload(JSON.parse(raw));
        if (payload && payload.moduleId === moduleId) {
          requestAnimationFrame(() => {
            if (payload.headingId) {
              const el = document.getElementById(payload.headingId);
              if (el) {
                el.scrollIntoView({ block: "start" });
                restored = true;
              }
            }
            if (!restored && payload.scrollRatio != null) {
              const max =
                document.documentElement.scrollHeight - window.innerHeight;
              window.scrollTo({
                top: clampScrollRatio(payload.scrollRatio) * Math.max(0, max),
              });
            }
          });
        }
      }
    } catch {
      /* ignore */
    }

    let headingId: string | undefined = tocIds[0];
    const obs =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              const visible = entries
                .filter((e) => e.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
              if (visible?.target?.id) headingId = visible.target.id;
            },
            { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
          )
        : null;

    for (const id of tocIds) {
      const el = document.getElementById(id);
      if (el && obs) obs.observe(el);
    }

    const save = () => {
      try {
        const max =
          document.documentElement.scrollHeight - window.innerHeight;
        const scrollRatio =
          max > 0 ? clampScrollRatio(window.scrollY / max) : 0;
        const payload = buildResumePayload({
          moduleId,
          headingId,
          scrollRatio,
          now: Date.now(),
        });
        localStorage.setItem(key, JSON.stringify(payload));
      } catch {
        /* ignore */
      }
    };

    const onScroll = () => {
      window.clearTimeout((onScroll as unknown as { t?: number }).t);
      (onScroll as unknown as { t?: number }).t = window.setTimeout(save, 400);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("beforeunload", save);
    return () => {
      obs?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeunload", save);
      save();
    };
  }, [moduleId, tocIds]);

  return <>{children}</>;
}

export function ModuleShell({
  moduleId,
  tocIds,
  hasLesson,
  toolbar,
  lesson,
  secondary,
  footerNav,
}: {
  moduleId: string;
  tocIds: string[];
  hasLesson: boolean;
  toolbar: ReactNode;
  lesson: ReactNode;
  secondary: ReactNode;
  /** Always visible (even in focus mode) — e.g. prev/next */
  footerNav?: ReactNode;
}) {
  const { focus, toggle } = useFocusMode();

  return (
    <div className="space-y-8">
      {hasLesson ? <ReadingProgressBar targetId="lesson-article" /> : null}
      <div className="flex flex-wrap items-center gap-3">
        {toolbar}
        {hasLesson ? (
          <FocusModeToggle focus={focus} onToggle={toggle} />
        ) : null}
      </div>
      <div id="lesson-article">
        {hasLesson ? (
          <ResumeReading moduleId={moduleId} tocIds={tocIds}>
            {lesson}
          </ResumeReading>
        ) : (
          lesson
        )}
      </div>
      {footerNav}
      <div className={cn(focus && "hidden")}>{secondary}</div>
    </div>
  );
}
