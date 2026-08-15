"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ensureStageL1 } from "@/lib/learning/actions";
import { GenerationStatus } from "./generation-status";

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

  function run(regenerate = false) {
    setError(null);
    startTransition(async () => {
      const res = await ensureStageL1(stageId, { regenerate });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  useEffect(() => {
    if (status === "ready") return;
    run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-run once per stage open
  }, [stageId, status]);

  if (status === "ready" && !pending && !error) return null;

  if (error) {
    return (
      <GenerationStatus
        phase="error"
        flow="l1"
        errorMessage={error}
        onRetry={() => run(true)}
      />
    );
  }

  return <GenerationStatus phase="l1_building" flow="l1" />;
}
