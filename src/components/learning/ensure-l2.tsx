"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ensureModuleL2 } from "@/lib/learning/actions";
import { GenerationStatus } from "./generation-status";

export function EnsureL2({
  moduleId,
  status,
}: {
  moduleId: string;
  status: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(regenerate = false) {
    setError(null);
    startTransition(async () => {
      const res = await ensureModuleL2(moduleId, { regenerate });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-run once per module open
  }, [moduleId, status]);

  if (status === "ready" && !pending && !error) return null;

  if (error || status === "error") {
    return (
      <GenerationStatus
        phase="error"
        flow="l2"
        errorMessage={error ?? "Lesson generation failed"}
        onRetry={() => run(status === "error" || Boolean(error))}
      />
    );
  }

  return <GenerationStatus phase="l2_building" flow="l2" />;
}
