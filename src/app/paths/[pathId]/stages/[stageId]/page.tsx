import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { formatMinutes } from "@/lib/utils";
import { presentProgressSummary } from "@/lib/learning/progress-summary";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EnsureL1 } from "@/components/learning/ensure-l1";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function StagePage({
  params,
}: {
  params: Promise<{ pathId: string; stageId: string }>;
}) {
  const { pathId, stageId } = await params;
  const { supabase, user } = await requireUser();
  if (!user) redirect("/login");

  const { data: stage } = await supabase
    .from("stages")
    .select("*, paths(*)")
    .eq("id", stageId)
    .single();

  if (!stage) notFound();
  const path = stage.paths as {
    id: string;
    user_id: string;
    title: string | null;
    topic: string;
  };
  if (path.user_id !== user.id || path.id !== pathId) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("stage_id", stageId)
    .order("position");

  const progress = presentProgressSummary(modules ?? []);
  const pathTitle = path.title ?? path.topic;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:py-10">
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: pathTitle, href: `/paths/${pathId}` },
            { label: stage.title },
          ]}
        />
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {stage.title}
        </h1>
        <p className="mt-2 text-muted">{stage.summary}</p>
        {progress.total > 0 ? (
          <div className="mt-4 space-y-1">
            <div className="flex flex-wrap gap-2 text-xs text-muted">
              <span>
                {progress.done}/{progress.total} modules · {progress.percent}%
              </span>
              {progress.remainingMinutes > 0 ? (
                <span>
                  · ~{formatMinutes(progress.remainingMinutes)} remaining
                </span>
              ) : null}
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-muted-bg"
              aria-hidden
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      <EnsureL1 stageId={stageId} status={stage.l1_status} />

      {stage.l1_status === "error" && stage.error_message ? (
        <p className="text-sm text-danger-fg">{stage.error_message}</p>
      ) : null}

      {stage.l1_status === "ready" && modules ? (
        modules.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No modules</CardTitle>
              <CardDescription>
                This stage has no modules yet. Try regenerating from the path
                overview if something went wrong.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ul className="space-y-3">
            {modules.map((m, i) => (
              <li key={m.id}>
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">
                        {i + 1}. {m.title}
                      </CardTitle>
                      {m.completed_at ? (
                        <Badge variant="success">Done</Badge>
                      ) : null}
                      {m.l2_status === "ready" ? (
                        <Badge variant="neutral">Lesson ready</Badge>
                      ) : m.l2_status === "error" ? (
                        <Badge variant="warning">Error</Badge>
                      ) : (
                        <Badge variant="neutral">Generate on open</Badge>
                      )}
                    </div>
                    <CardDescription>{m.blurb}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted">
                      {formatMinutes(m.est_minutes)}
                    </span>
                    <Link
                      href={`/paths/${pathId}/modules/${m.id}`}
                      className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
                    >
                      Open module
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}
