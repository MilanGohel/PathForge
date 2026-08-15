"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
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
    <div className="mx-auto max-w-lg space-y-4 px-4 py-16">
      <h1 className="text-xl font-semibold">Dashboard failed to load</h1>
      <p className="text-sm text-muted">
        Try again, or start a new path if the problem persists.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => reset()}>
          Retry
        </Button>
        <Link
          href="/paths/new"
          className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-semibold hover:bg-muted-bg"
        >
          New path
        </Link>
      </div>
    </div>
  );
}
