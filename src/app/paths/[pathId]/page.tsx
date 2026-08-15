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
      : { data: [] as Array<{ id: string; stage_id: string; completed_at: string | null }> };

  const completedByStage = new Map<string, { done: number; total: number }>();
  for (const m of modules ?? []) {
    const cur = completedByStage.get(m.stage_id) ?? { done: 0, total: 0 };
    cur.total += 1;
    if (m.completed_at) cur.done += 1;
    completedByStage.set(m.stage_id, cur);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {path.title ?? path.topic}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {path.summary ?? path.goal}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>~{formatHours(Number(path.est_hours))}</Badge>
          <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            {path.hours_per_week}h/week
          </Badge>
          {path.pack_slug ? <Badge>{path.pack_slug}</Badge> : null}
        </div>
      </div>

      {path.domain_alert ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {path.domain_alert}
        </div>
      ) : null}

      {path.status === "error" ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {path.error_message ?? "Path generation failed."}{" "}
          <Link href={`/paths/${pathId}/diagnostic`} className="underline">
            Retry diagnostic
          </Link>
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Stages</h2>
        <p className="text-sm text-zinc-500">
          Modules generate when you open a stage (L1). Lessons generate when you
          open a module (L2).
        </p>
        <ul className="space-y-3">
          {(stages ?? []).map((stage, i) => {
            const prog = completedByStage.get(stage.id);
            return (
              <li key={stage.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      <span className="mr-2 text-zinc-400">{i + 1}.</span>
                      {stage.title}
                    </CardTitle>
                    <CardDescription>{stage.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-zinc-500">
                      {stage.est_hours != null
                        ? `~${formatHours(Number(stage.est_hours))}`
                        : null}
                      {prog
                        ? ` · ${prog.done}/${prog.total} modules done`
                        : stage.l1_status === "ready"
                          ? " · modules ready"
                          : " · modules not generated yet"}
                    </div>
                    <Link
                      href={`/paths/${pathId}/stages/${stage.id}`}
                      className="inline-flex h-9 items-center rounded-lg bg-teal-600 px-3 text-sm font-medium text-white hover:bg-teal-500"
                    >
                      Open stage
                    </Link>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
