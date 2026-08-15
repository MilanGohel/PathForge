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
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted">Signed in as {user.email}</p>
        </div>
        <Link
          href="/paths/new"
          className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
        >
          New path
        </Link>
      </div>

      {active ? (
        <Card className="border-primary/25">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{active.title ?? active.topic}</CardTitle>
              <Badge>Active</Badge>
              <Badge variant="neutral">{active.status}</Badge>
            </div>
            <CardDescription>{active.summary ?? active.goal}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {active.domain_alert ? (
              <div className="rounded-xl border border-warning-border bg-warning-bg px-4 py-3 text-sm text-warning-fg">
                {active.domain_alert}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-4 text-sm text-muted">
              <span>~{formatHours(Number(active.est_hours))} total</span>
              <span>
                {progress.done}/{progress.total || "—"} modules complete
              </span>
              <span>{active.hours_per_week}h / week</span>
            </div>
            {today ? (
              <div className="rounded-xl border border-border bg-muted-bg/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Today
                </p>
                <p className="mt-1 font-medium">{today.title}</p>
                <p className="text-sm text-muted">
                  {today.stageTitle}
                  {today.estMinutes
                    ? ` · ${formatMinutes(today.estMinutes)}`
                    : ""}
                </p>
                <Link
                  href={`/paths/${active.id}/modules/${today.id}`}
                  className="mt-3 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
                >
                  Continue
                </Link>
              </div>
            ) : active.status === "ready" ? (
              <p className="text-sm text-muted">
                {progress.total > 0 && progress.done === progress.total
                  ? "All generated modules complete. Open a stage to expand more, or start a new path."
                  : "Open a stage to generate modules, then your Today card will appear."}
              </p>
            ) : active.status === "diagnostic" ||
              active.status === "generating_l0" ? (
              <Link
                href={`/paths/${active.id}/diagnostic`}
                className="inline-flex text-sm font-medium text-primary hover:underline"
              >
                Finish diagnostic →
              </Link>
            ) : null}
            <Link
              href={`/paths/${active.id}`}
              className="inline-flex text-sm font-medium text-primary hover:underline"
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
              Start from the AI Engineering pack or type any topic. Your Today
              card and path overview will show up here.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link
              href="/paths/new?pack=ai-engineering"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
            >
              Start AI Engineering
            </Link>
            <Link
              href="/paths/new"
              className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted-bg"
            >
              Custom topic
            </Link>
          </CardContent>
        </Card>
      )}

      {paths && paths.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">
            All paths
          </h2>
          <ul className="space-y-2">
            {paths.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3"
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
                  <p className="text-xs text-muted">
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
                      className="text-xs font-medium text-primary hover:underline"
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
