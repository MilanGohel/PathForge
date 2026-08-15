"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GenerationStatus } from "./generation-status";

const POLL_MS = 2000;
/** ~5 minutes of polling before we surface a soft timeout. */
const MAX_POLLS = 150;

type EnsureResponse = {
  ok?: boolean;
  status?: string;
  error?: string;
  errorMessage?: string | null;
};

async function postEnsure(
  moduleId: string,
  opts?: { regenerate?: boolean; direction?: string | null },
): Promise<EnsureResponse> {
  const res = await fetch("/api/modules/ensure-l2", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      moduleId,
      regenerate: opts?.regenerate ?? false,
      direction: opts?.direction ?? null,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as EnsureResponse;
  if (!res.ok) {
    return {
      error: body.error ?? `Request failed (${res.status})`,
      status: body.status,
    };
  }
  return body;
}

async function pollStatus(moduleId: string): Promise<EnsureResponse> {
  const res = await fetch(
    `/api/modules/ensure-l2?moduleId=${encodeURIComponent(moduleId)}`,
    { method: "GET", cache: "no-store" },
  );
  const body = (await res.json().catch(() => ({}))) as EnsureResponse;
  if (!res.ok) {
    return { error: body.error ?? `Status failed (${res.status})` };
  }
  return body;
}

function sleep(ms: number, signal?: { cancelled: boolean }) {
  return new Promise<void>((resolve) => {
    const id = setTimeout(resolve, ms);
    if (signal?.cancelled) {
      clearTimeout(id);
      resolve();
    }
  });
}

/**
 * Kick off L2 generation via fetch (not a server action) and stay on the
 * module URL until ready. Long server actions were reconciling the App Router
 * back to the previous stage page after the wait.
 */
export function EnsureL2({
  moduleId,
  status,
}: {
  moduleId: string;
  status: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(status !== "ready");
  const runIdRef = useRef(0);

  const settleOnReady = useCallback(() => {
    setBusy(false);
    setError(null);
    router.refresh();
  }, [router]);

  const runEnsure = useCallback(
    async (regenerate: boolean) => {
      const runId = ++runIdRef.current;
      const alive = () => runIdRef.current === runId;

      setError(null);
      setBusy(true);

      // Start generation without blocking the poll loop on the full POST body.
      // If the POST connection drops after the server finished, polling still wins.
      void postEnsure(moduleId, { regenerate }).then(async (res) => {
        if (!alive()) return;
        if (res.status === "ready") {
          settleOnReady();
          return;
        }
        // Hard failure only if DB is not still generating
        if (res.error) {
          const st = await pollStatus(moduleId);
          if (!alive()) return;
          if (st.status === "ready") {
            settleOnReady();
            return;
          }
          if (st.status === "generating") return; // poll loop continues
          setError(res.error);
          setBusy(false);
        }
      });

      for (let i = 0; i < MAX_POLLS; i++) {
        if (!alive()) return;
        // Small delay before first poll so POST can mark "generating"
        await sleep(i === 0 ? 400 : POLL_MS);
        if (!alive()) return;

        try {
          const st = await pollStatus(moduleId);
          if (!alive()) return;
          if (st.status === "ready") {
            settleOnReady();
            return;
          }
          if (st.status === "error") {
            setError(
              st.errorMessage ?? st.error ?? "Lesson generation failed",
            );
            setBusy(false);
            return;
          }
        } catch {
          // transient network — keep polling
        }
      }

      if (!alive()) return;
      setError("Lesson is taking longer than expected. Retry to continue.");
      setBusy(false);
    },
    [moduleId, settleOnReady],
  );

  useEffect(() => {
    if (status === "ready") {
      setBusy(false);
      setError(null);
      return;
    }
    void runEnsure(false);
    return () => {
      // Invalidate in-flight loop on unmount / module change
      runIdRef.current += 1;
    };
  }, [moduleId, status, runEnsure]);

  if (status === "ready" && !busy && !error) return null;

  if (error || (status === "error" && !busy)) {
    return (
      <GenerationStatus
        phase="error"
        flow="l2"
        errorMessage={error ?? "Lesson generation failed"}
        onRetry={() => void runEnsure(true)}
      />
    );
  }

  return <GenerationStatus phase="l2_building" flow="l2" />;
}
