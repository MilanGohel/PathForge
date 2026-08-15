import type { BudgetLevel } from "@/lib/learning/budget-warning";
import { cn } from "@/lib/utils";

export function BudgetBanner({
  level,
  used,
  limit,
  remaining,
  className,
}: {
  level: BudgetLevel;
  used: number;
  limit: number;
  remaining: number;
  className?: string;
}) {
  if (level === "ok") return null;

  if (level === "blocked") {
    return (
      <div
        className={cn(
          "rounded-xl border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger-fg",
          className,
        )}
        role="status"
      >
        <p className="font-medium">Daily generation budget reached</p>
        <p className="mt-1 opacity-90">
          Used {used}/{limit} generations today (UTC day). You can still read
          cached lessons; new generation unlocks after midnight UTC, or raise{" "}
          <code className="text-xs">GENERATION_DAILY_BUDGET</code>.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-warning-border bg-warning-bg px-4 py-3 text-sm text-warning-fg",
        className,
      )}
      role="status"
    >
      <p className="font-medium">Generation budget running low</p>
      <p className="mt-1 opacity-90">
        {remaining} of {limit} generations left today (UTC). Prefer opening
        cached modules when you can.
      </p>
    </div>
  );
}
