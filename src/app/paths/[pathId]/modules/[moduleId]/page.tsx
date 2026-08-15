import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { formatMinutes } from "@/lib/utils";
import {
  isLegacyLesson,
  presentLessonThinness,
} from "@/lib/learning/lesson-format";
import { extractLessonToc } from "@/lib/learning/lesson-toc";
import {
  presentPathNavigation,
  type NavModule,
} from "@/lib/learning/path-navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EnsureL2 } from "@/components/learning/ensure-l2";
import { LessonBody } from "@/components/learning/lesson-body";
import { LessonTocNav } from "@/components/learning/lesson-toc";
import {
  CompleteButton,
  NotesEditor,
  QuizBlock,
  RegenerateModuleButton,
} from "@/components/learning/module-actions";
import {
  ModulePrevNext,
  PostCompleteNudge,
} from "@/components/learning/module-nav";
import { ModuleShell } from "@/components/learning/reading-chrome";
import { ResourceList } from "@/components/learning/resource-list";
import { TutorChat } from "@/components/learning/tutor-chat";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LessonCard } from "@/types/domain";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ pathId: string; moduleId: string }>;
}) {
  const { pathId, moduleId } = await params;
  const { supabase, user } = await requireUser();
  if (!user) redirect("/login");

  const { data: mod } = await supabase
    .from("modules")
    .select("*, stages(*, paths(*))")
    .eq("id", moduleId)
    .single();

  if (!mod) notFound();

  const stage = mod.stages as {
    id: string;
    title: string;
    position: number;
    paths: {
      id: string;
      user_id: string;
      title: string | null;
      topic: string;
    };
  };

  if (stage.paths.user_id !== user.id || stage.paths.id !== pathId) {
    notFound();
  }

  const { data: allStages } = await supabase
    .from("stages")
    .select("id, title, position")
    .eq("path_id", pathId)
    .order("position");

  const stageIds = (allStages ?? []).map((s) => s.id);
  const { data: allModules } =
    stageIds.length > 0
      ? await supabase
          .from("modules")
          .select("id, title, position, completed_at, stage_id")
          .in("stage_id", stageIds)
      : { data: [] as Array<{
          id: string;
          title: string;
          position: number;
          completed_at: string | null;
          stage_id: string;
        }> };

  const stageById = new Map((allStages ?? []).map((s) => [s.id, s]));
  const navModules: NavModule[] = (allModules ?? [])
    .map((m) => {
      const st = stageById.get(m.stage_id);
      if (!st) return null;
      return {
        id: m.id,
        title: m.title,
        position: m.position,
        completed_at: m.completed_at,
        stage: {
          id: st.id,
          title: st.title,
          position: st.position,
        },
      };
    })
    .filter(Boolean) as NavModule[];

  const nav = presentPathNavigation(navModules, moduleId);

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("module_id", moduleId)
    .maybeSingle();

  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("module_id", moduleId)
    .order("position");

  const { data: quizItems } = await supabase
    .from("quiz_items")
    .select("*")
    .eq("module_id", moduleId)
    .order("position");

  const { data: note } = await supabase
    .from("module_notes")
    .select("*")
    .eq("module_id", moduleId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: thread } = await supabase
    .from("tutor_threads")
    .select("id")
    .eq("module_id", moduleId)
    .eq("user_id", user.id)
    .maybeSingle();

  let initialMessages: Array<{ role: "user" | "assistant"; content: string }> =
    [];
  if (thread) {
    const { data: msgs } = await supabase
      .from("tutor_messages")
      .select("role, content")
      .eq("thread_id", thread.id)
      .order("created_at")
      .limit(50);
    initialMessages =
      msgs
        ?.filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })) ?? [];
  }

  const mdx = (lesson?.mdx as string | null) ?? "";
  const cards = (lesson?.cards as LessonCard[] | null) ?? [];
  const legacy = isLegacyLesson({ mdx, cards });
  const toc = !legacy && mdx.trim() ? extractLessonToc(mdx) : [];
  const thinness =
    !legacy && mdx.trim() ? presentLessonThinness(mdx) : null;
  const pathTitle = stage.paths.title ?? stage.paths.topic;
  const completed = Boolean(mod.completed_at);
  const tocIds = toc.map((t) => t.id);
  const tocTitles = toc.map((t) => t.title);

  const lessonSection = (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">Lesson</h2>

      {mdx.trim() ? (
        <div className="relative">
          {toc.length > 0 ? (
            <div className="mb-4 xl:hidden">
              <LessonTocNav entries={toc} mobileOnly />
            </div>
          ) : null}

          <LessonBody source={mdx} toc={toc} />

          {toc.length > 0 ? (
            <aside className="pointer-events-none absolute inset-y-0 left-[calc(100%+2.5rem)] hidden w-52 xl:block">
              <div className="pointer-events-auto sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
                <LessonTocNav entries={toc} desktopOnly />
              </div>
            </aside>
          ) : null}
        </div>
      ) : legacy ? (
        <div className="space-y-4">
          {cards.map((card) => (
            <Card key={card.id}>
              <CardHeader>
                <CardDescription className="uppercase tracking-wide">
                  {card.kind.replaceAll("_", " ")}
                </CardDescription>
                <CardTitle className="text-base">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {card.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">Lesson body missing.</p>
      )}
    </section>
  );

  const secondary = (
    <>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Go deeper</h2>
        <p className="text-sm text-muted">
          Optional — the lesson above should stand on its own. At most a few
          curated links.
        </p>
        <ResourceList
          resources={(resources ?? []).map((r) => ({
            id: r.id,
            title: r.title,
            url: r.url,
            kind: r.kind,
            provider: r.provider,
            snippet: r.snippet,
          }))}
        />
      </section>

      <QuizBlock
        items={(quizItems ?? []).map((q) => ({
          id: q.id,
          prompt: q.prompt,
          choices: (q.choices as string[]) ?? [],
        }))}
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Your notes</h2>
        <NotesEditor moduleId={moduleId} initial={note?.body ?? ""} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Tutor</h2>
        <TutorChat
          moduleId={moduleId}
          initialMessages={initialMessages}
          lessonTitles={tocTitles}
        />
      </section>
    </>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:py-10">
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: pathTitle, href: `/paths/${pathId}` },
            {
              label: stage.title,
              href: `/paths/${pathId}/stages/${stage.id}`,
            },
            { label: mod.title },
          ]}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">{mod.title}</h1>
          {completed ? <Badge variant="success">Complete</Badge> : null}
          {nav.total > 0 && nav.index >= 0 ? (
            <Badge variant="neutral">
              {nav.index + 1}/{nav.total}
            </Badge>
          ) : null}
        </div>
        <p className="mt-2 text-muted">{mod.blurb}</p>
        <p className="mt-1 text-xs text-muted">
          {formatMinutes(mod.est_minutes)}
        </p>
      </div>

      <EnsureL2 moduleId={moduleId} status={mod.l2_status} />

      {mod.l2_status === "error" ? (
        <p className="text-sm text-danger-fg">{mod.error_message}</p>
      ) : null}

      {mod.l2_status === "ready" ? (
        <>
          {legacy ? (
            <div className="rounded-xl border border-warning-border bg-warning-bg px-4 py-3 text-sm text-warning-fg">
              <p className="font-medium">Old short-card format</p>
              <p className="mt-1 opacity-90">
                This lesson was generated before full MDX teaching content. Hit{" "}
                <strong>Regenerate lesson</strong> for a teachable module with
                a topic-specific outline (uses one AI generation).
              </p>
            </div>
          ) : null}

          {thinness?.thin ? (
            <div className="rounded-xl border border-warning-border bg-warning-bg px-4 py-3 text-sm text-warning-fg">
              <p className="font-medium">Lesson looks thin</p>
              <p className="mt-1 opacity-90">
                {thinness.reasons.join(" · ")}. Regenerate for a fuller teachable
                module.
              </p>
            </div>
          ) : null}

          <PostCompleteNudge
            pathId={pathId}
            nav={nav}
            completed={completed}
          />

          <ModuleShell
            moduleId={moduleId}
            tocIds={tocIds}
            hasLesson={Boolean(mdx.trim()) && !legacy}
            toolbar={
              <>
                <CompleteButton moduleId={moduleId} completed={completed} />
                <RegenerateModuleButton moduleId={moduleId} />
              </>
            }
            lesson={lessonSection}
            footerNav={<ModulePrevNext pathId={pathId} nav={nav} />}
            secondary={secondary}
          />
        </>
      ) : null}
    </div>
  );
}
