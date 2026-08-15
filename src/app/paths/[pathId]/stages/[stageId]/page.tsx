import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { formatMinutes } from "@/lib/utils";
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

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <div>
        <Link
          href={`/paths/${pathId}`}
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← {path.title ?? path.topic}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {stage.title}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{stage.summary}</p>
      </div>

      <EnsureL1 stageId={stageId} status={stage.l1_status} />

      {stage.l1_status === "error" ? (
        <p className="text-sm text-red-600">{stage.error_message}</p>
      ) : null}

      {stage.l1_status === "ready" && modules ? (
        <ul className="space-y-3">
          {modules.map((m, i) => (
            <li key={m.id}>
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">
                      {i + 1}. {m.title}
                    </CardTitle>
                    {m.completed_at ? <Badge>Done</Badge> : null}
                    {m.l2_status === "ready" ? (
                      <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                        Lesson ready
                      </Badge>
                    ) : (
                      <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                        Generate on open
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{m.blurb}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-500">
                    {formatMinutes(m.est_minutes)}
                  </span>
                  <Link
                    href={`/paths/${pathId}/modules/${m.id}`}
                    className="inline-flex h-9 items-center rounded-lg bg-teal-600 px-3 text-sm font-medium text-white hover:bg-teal-500"
                  >
                    Open module
                  </Link>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
