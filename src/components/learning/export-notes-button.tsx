"use client";

import { useState, useTransition } from "react";
import { exportPathNotesMarkdown } from "@/lib/learning/actions";
import { Button } from "@/components/ui/button";

export function ExportNotesButton({ pathId }: { pathId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="inline-flex flex-col gap-1">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await exportPathNotesMarkdown(pathId);
            if (!res.ok) {
              setError(res.error);
              return;
            }
            const blob = new Blob([res.data.markdown], {
              type: "text/markdown;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = res.data.filename;
            a.click();
            URL.revokeObjectURL(url);
          });
        }}
      >
        {pending ? "Exporting…" : "Export notes"}
      </Button>
      {error ? (
        <p className="text-xs text-danger-fg" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
