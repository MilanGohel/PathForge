"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-start justify-center gap-4 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-sm text-muted">
        An unexpected error occurred. You can retry or return to the dashboard.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => reset()}>
          Retry
        </Button>
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-semibold hover:bg-muted-bg"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
