import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { pickTodayModule } from "@/lib/learning/today";
import { formatHours, formatMinutes } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { setActivePath } from "@/lib/learning/actions";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  if (!user) redirect("/login");

  const { data: paths } = await supabase
    .from("paths")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const active = paths?.find((p) => p.is_active) ?? paths?.[0] ?? null;

  let today: ReturnType<typeof pickTodayModule> = null;
  let progress = { done: 0, total: 0 };

  if (active?.status === "ready") {
    const { data: stages } = await supabase
      .from("stages")
      .select("id, title, position, path_id")
      .eq("path_id", active.id)
      .order("position");

    const stageIds = (stages ?? []).map((s) => s.id);
    if (stageIds.length) {
      const { data: modules } = await supabase
        .from("modules")
        .select("id, title, blurb, est_minutes, completed_at, position, stage_id")
        .in("stage_id", stageIds);

      const stageById = new Map((stages ?? []).map((s) => [s.id, s]));
      const enriched =
        modules?.map((m) => {
          const st = stageById.get(m.stage_id)!;
          return {
            ...m,
            stage: {
              id: st.id,
              title: st.title,
              position: st.position,
              path_id: st.path_id,
            },
          };
        }) ?? [];

      progress.total = enriched.length;
      progress.done = enriched.filter((m) => m.completed_at).length;
      today = pickTodayModule(enriched);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500">
            Signed in as {user.email}
          </p>
        </div>
        <Link
          href="/paths/new"
          className="inline-flex h-10 items-center rounded-lg bg-teal-600 px-4 text-sm font-medium text-white hover:bg-teal-500"
        >
          New path
        </Link>
      </div>

      {active ? (
        <Card className="border-teal-200 dark:border-teal-900">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{active.title ?? active.topic}</CardTitle>
              <Badge>Active</Badge>
              <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                {active.status}
              </Badge>
            </div>
            <CardDescription>{active.summary ?? active.goal}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {active.domain_alert ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                {active.domain_alert}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <span>~{formatHours(Number(active.est_hours))} total</span>
              <span>
                {progress.done}/{progress.total || "—"} modules complete
              </span>
              <span>{active.hours_per_week}h / week</span>
            </div>
            {today ? (
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Today
                </p>
                <p className="mt-1 font-medium">{today.title}</p>
                <p className="text-sm text-zinc-500">
                  {today.stageTitle}
                  {today.estMinutes
                    ? ` · ${formatMinutes(today.estMinutes)}`
                    : ""}
                </p>
                <Link
                  href={`/paths/${active.id}/modules/${today.id}`}
                  className="mt-3 inline-flex h-9 items-center rounded-lg bg-teal-600 px-3 text-sm font-medium text-white hover:bg-teal-500"
                >
                  Continue
                </Link>
              </div>
            ) : active.status === "ready" ? (
              <p className="text-sm text-zinc-500">
                {progress.total > 0 && progress.done === progress.total
                  ? "All generated modules complete. Open a stage to expand more, or start a new path."
                  : "Open a stage to generate modules, then your Today card will appear."}
              </p>
            ) : active.status === "diagnostic" ||
              active.status === "generating_l0" ? (
              <Link
                href={`/paths/${active.id}/diagnostic`}
                className="inline-flex text-sm font-medium text-teal-700 dark:text-teal-300"
              >
                Finish diagnostic →
              </Link>
            ) : null}
            <Link
              href={`/paths/${active.id}`}
              className="inline-flex text-sm font-medium text-teal-700 dark:text-teal-300"
            >
              Open path overview →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No paths yet</CardTitle>
            <CardDescription>
              Start from the AI Engineering pack or type any topic.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/paths/new"
              className="inline-flex h-10 items-center rounded-lg bg-teal-600 px-4 text-sm font-medium text-white hover:bg-teal-500"
            >
              Create your first path
            </Link>
          </CardContent>
        </Card>
      )}

      {paths && paths.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">All paths</h2>
          <ul className="space-y-2">
            {paths.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800"
              >
                <div>
                  <Link
                    href={
                      p.status === "ready"
                        ? `/paths/${p.id}`
                        : `/paths/${p.id}/diagnostic`
                    }
                    className="font-medium hover:underline"
                  >
                    {p.title ?? p.topic}
                  </Link>
                  <p className="text-xs text-zinc-500">
                    {p.source}
                    {p.pack_slug ? ` · ${p.pack_slug}` : ""} · {p.status}
                  </p>
                </div>
                {!p.is_active ? (
                  <form
                    action={async () => {
                      "use server";
                      await setActivePath(p.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-xs font-medium text-teal-700 dark:text-teal-300"
                    >
                      Set active
                    </button>
                  </form>
                ) : (
                  <Badge>Active</Badge>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
