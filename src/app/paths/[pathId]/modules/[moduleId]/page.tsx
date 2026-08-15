import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { formatMinutes } from "@/lib/utils";
import { isLegacyLesson } from "@/lib/learning/lesson-format";
import { extractLessonToc } from "@/lib/learning/lesson-toc";
import { EnsureL2 } from "@/components/learning/ensure-l2";
import { LessonBody } from "@/components/learning/lesson-body";
import { LessonTocNav } from "@/components/learning/lesson-toc";
import {
  CompleteButton,
  NotesEditor,
  QuizBlock,
  RegenerateModuleButton,
} from "@/components/learning/module-actions";
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

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-10">
      <div className="max-w-3xl">
        <Link
          href={`/paths/${pathId}/stages/${stage.id}`}
          className="text-sm text-muted hover:text-foreground"
        >
          ← {stage.title}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">{mod.title}</h1>
          {mod.completed_at ? <Badge variant="success">Complete</Badge> : null}
        </div>
        <p className="mt-2 text-muted">{mod.blurb}</p>
        <p className="mt-1 text-xs text-muted">{formatMinutes(mod.est_minutes)}</p>
      </div>

      <div className="max-w-3xl">
        <EnsureL2 moduleId={moduleId} status={mod.l2_status} />
      </div>

      {mod.l2_status === "error" ? (
        <p className="max-w-3xl text-sm text-danger-fg">{mod.error_message}</p>
      ) : null}

      {mod.l2_status === "ready" ? (
        <>
          <div className="flex max-w-3xl flex-wrap gap-3">
            <CompleteButton
              moduleId={moduleId}
              completed={Boolean(mod.completed_at)}
            />
            <RegenerateModuleButton moduleId={moduleId} />
          </div>

          {legacy ? (
            <div className="max-w-3xl rounded-xl border border-warning-border bg-warning-bg px-4 py-3 text-sm text-warning-fg">
              <p className="font-medium">Old short-card format</p>
              <p className="mt-1 opacity-90">
                This lesson was generated before full MDX teaching content. Hit{" "}
                <strong>Regenerate lesson</strong> for a ~10–15 min teachable
                module (uses one AI generation).
              </p>
            </div>
          ) : null}

          {/* Lesson + TOC */}
          <section className="space-y-4">
            <h2 className="max-w-3xl text-lg font-semibold tracking-tight">
              Lesson
            </h2>
            {mdx.trim() ? (
              <div className="lg:grid lg:grid-cols-[minmax(0,42rem)_14rem] lg:gap-10">
                <div className="min-w-0">
                  {toc.length > 0 ? (
                    <div className="mb-4 lg:hidden">
                      <LessonTocNav entries={toc} mobileOnly />
                    </div>
                  ) : null}
                  <LessonBody source={mdx} toc={toc} />
                </div>
                {toc.length > 0 ? (
                  <aside className="relative hidden min-h-full lg:block">
                    <div className="sticky top-20">
                      <LessonTocNav entries={toc} desktopOnly />
                    </div>
                  </aside>
                ) : null}
              </div>
            ) : legacy ? (
              <div className="max-w-3xl space-y-4">
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

          <section className="max-w-3xl space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Go deeper</h2>
            <p className="text-sm text-muted">
              Optional — the lesson above should stand on its own. At most a few
              curated links.
            </p>
            {(resources ?? []).length === 0 ? (
              <p className="text-sm text-muted">
                No external links for this module.
              </p>
            ) : (
              <ul className="space-y-2">
                {resources!.map((r) => (
                  <li key={r.id}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
                    >
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted">
                        {r.kind}
                        {r.provider ? ` · ${r.provider}` : ""}
                      </p>
                      {r.snippet ? (
                        <p className="mt-1 line-clamp-2 text-xs text-muted">
                          {r.snippet}
                        </p>
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="max-w-3xl">
            <QuizBlock
              items={(quizItems ?? []).map((q) => ({
                id: q.id,
                prompt: q.prompt,
                choices: (q.choices as string[]) ?? [],
              }))}
            />
          </div>

          <section className="max-w-3xl space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Your notes</h2>
            <NotesEditor moduleId={moduleId} initial={note?.body ?? ""} />
          </section>

          <section className="max-w-3xl space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Tutor</h2>
            <TutorChat moduleId={moduleId} initialMessages={initialMessages} />
          </section>
        </>
      ) : null}
    </div>
  );
}
