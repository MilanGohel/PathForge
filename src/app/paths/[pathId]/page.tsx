import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { formatHours } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function PathPage({
  params,
}: {
  params: Promise<{ pathId: string }>;
}) {
  const { pathId } = await params;
  const { supabase, user } = await requireUser();
  if (!user) redirect("/login");

  const { data: path } = await supabase
    .from("paths")
    .select("*")
    .eq("id", pathId)
    .eq("user_id", user.id)
    .single();

  if (!path) notFound();

  if (path.status !== "ready" && path.status !== "error") {
    redirect(`/paths/${pathId}/diagnostic`);
  }

  const { data: stages } = await supabase
    .from("stages")
    .select("*")
    .eq("path_id", pathId)
    .order("position");

  const stageIds = (stages ?? []).map((s) => s.id);
  const { data: modules } =
    stageIds.length > 0
      ? await supabase
          .from("modules")
          .select("id, stage_id, completed_at")
          .in("stage_id", stageIds)
      : {
          data: [] as Array<{
            id: string;
            stage_id: string;
            completed_at: string | null;
          }>,
        };

  const completedByStage = new Map<string, { done: number; total: number }>();
  for (const m of modules ?? []) {
    const cur = completedByStage.get(m.stage_id) ?? { done: 0, total: 0 };
    cur.total += 1;
    if (m.completed_at) cur.done += 1;
    completedByStage.set(m.stage_id, cur);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:py-10">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-foreground"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {path.title ?? path.topic}
        </h1>
        <p className="mt-2 text-muted">{path.summary ?? path.goal}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>~{formatHours(Number(path.est_hours))}</Badge>
          <Badge variant="neutral">{path.hours_per_week}h/week</Badge>
          {path.pack_slug ? <Badge variant="neutral">{path.pack_slug}</Badge> : null}
        </div>
      </div>

      {path.domain_alert ? (
        <div className="rounded-xl border border-warning-border bg-warning-bg px-4 py-3 text-sm text-warning-fg">
          {path.domain_alert}
        </div>
      ) : null}

      {path.status === "error" ? (
        <div className="rounded-xl border border-danger-border bg-danger-bg p-4 text-sm text-danger-fg">
          {path.error_message ?? "Path generation failed."}{" "}
          <Link
            href={`/paths/${pathId}/diagnostic`}
            className="font-medium underline"
          >
            Retry diagnostic
          </Link>
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Stages</h2>
        <p className="text-sm text-muted">
          Modules generate when you open a stage. Lessons generate when you open
          a module.
        </p>
        {(stages ?? []).length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No stages yet</CardTitle>
              <CardDescription>
                If generation failed, retry the diagnostic from the error above.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ul className="space-y-3">
            {(stages ?? []).map((stage, i) => {
              const prog = completedByStage.get(stage.id);
              const ready = stage.l1_status === "ready";
              return (
                <li key={stage.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        <span className="mr-2 text-muted">{i + 1}.</span>
                        {stage.title}
                      </CardTitle>
                      <CardDescription>{stage.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                        {stage.est_hours != null
                          ? `~${formatHours(Number(stage.est_hours))}`
                          : null}
                        {prog ? (
                          <span>
                            · {prog.done}/{prog.total} modules done
                          </span>
                        ) : ready ? (
                          <span>· modules ready</span>
                        ) : (
                          <Badge variant="neutral">Generate on open</Badge>
                        )}
                      </div>
                      <Link
                        href={`/paths/${pathId}/stages/${stage.id}`}
                        className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
                      >
                        Open stage
                      </Link>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
