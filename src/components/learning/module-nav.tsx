import Link from "next/link";
import type { PathNavigation } from "@/lib/learning/path-navigation";
import { cn } from "@/lib/utils";

export function ModulePrevNext({
  pathId,
  nav,
  className,
}: {
  pathId: string;
  nav: PathNavigation;
  className?: string;
}) {
  if (nav.total <= 0) return null;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4",
        className,
      )}
    >
      {nav.prev ? (
        <Link
          href={`/paths/${pathId}/modules/${nav.prev.id}`}
          className="inline-flex max-w-[48%] flex-col rounded-lg border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:border-primary/40"
        >
          <span className="text-xs text-muted">Previous</span>
          <span className="font-medium line-clamp-1">{nav.prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {nav.next ? (
        <Link
          href={`/paths/${pathId}/modules/${nav.next.id}`}
          className="ml-auto inline-flex max-w-[48%] flex-col rounded-lg border border-border bg-card px-3 py-2 text-right text-sm transition-colors hover:border-primary/40"
        >
          <span className="text-xs text-muted">Next</span>
          <span className="font-medium line-clamp-1">{nav.next.title}</span>
        </Link>
      ) : (
        <span className="ml-auto text-xs text-muted">End of path outline</span>
      )}
    </div>
  );
}

export function PostCompleteNudge({
  pathId,
  nav,
  completed,
}: {
  pathId: string;
  nav: PathNavigation;
  completed: boolean;
}) {
  if (!completed) return null;

  if (nav.pathComplete || !nav.nextIncomplete) {
    return (
      <div className="rounded-xl border border-success-border bg-success-bg px-4 py-3 text-sm text-success-fg">
        <p className="font-medium">Path modules complete</p>
        <p className="mt-1 opacity-90">
          Nice work.{" "}
          <Link href={`/paths/${pathId}`} className="font-medium underline">
            Back to path overview
          </Link>{" "}
          or open another stage if more modules appear later.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/25 bg-primary-soft/40 px-4 py-3 text-sm">
      <p className="font-medium text-primary-soft-fg">Module marked complete</p>
      <p className="mt-1 text-muted">
        Continue with{" "}
        <span className="font-medium text-foreground">
          {nav.nextIncomplete.title}
        </span>
        ?
      </p>
      <Link
        href={`/paths/${pathId}/modules/${nav.nextIncomplete.id}`}
        className="mt-3 inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
      >
        Continue · next module
      </Link>
    </div>
  );
}
