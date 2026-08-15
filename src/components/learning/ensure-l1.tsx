"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ensureStageL1 } from "@/lib/learning/actions";
import { GenerationStatus } from "./generation-status";
import { Button } from "@/components/ui/button";

export function EnsureL1({
  stageId,
  status,
}: {
  stageId: string;
  status: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (status === "ready") return;
    startTransition(async () => {
      const res = await ensureStageL1(stageId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }, [stageId, status, router]);

  if (status === "ready" && !pending) return null;

  if (error) {
    return (
      <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        <Button
          size="sm"
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const res = await ensureStageL1(stageId, { regenerate: true });
              if (!res.ok) setError(res.error);
              else router.refresh();
            });
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return <GenerationStatus label="Expanding this stage into modules (L1)…" />;
}
