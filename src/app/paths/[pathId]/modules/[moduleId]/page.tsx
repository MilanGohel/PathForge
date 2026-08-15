import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { formatMinutes } from "@/lib/utils";
import { EnsureL2 } from "@/components/learning/ensure-l2";
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

const CARD_ORDER = [
  "concept",
  "why_it_matters",
  "example",
  "pitfall",
  "try_this",
] as const;

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

  const cards = (lesson?.cards as LessonCard[] | null) ?? [];
  const sortedCards = [...cards].sort(
    (a, b) => CARD_ORDER.indexOf(a.kind) - CARD_ORDER.indexOf(b.kind),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <div>
        <Link
          href={`/paths/${pathId}/stages/${stage.id}`}
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← {stage.title}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">{mod.title}</h1>
          {mod.completed_at ? <Badge>Complete</Badge> : null}
        </div>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{mod.blurb}</p>
        <p className="mt-1 text-xs text-zinc-500">
          {formatMinutes(mod.est_minutes)}
        </p>
      </div>

      <EnsureL2 moduleId={moduleId} status={mod.l2_status} />

      {mod.l2_status === "error" ? (
        <p className="text-sm text-red-600">{mod.error_message}</p>
      ) : null}

      {mod.l2_status === "ready" ? (
        <>
          <div className="flex flex-wrap gap-3">
            <CompleteButton
              moduleId={moduleId}
              completed={Boolean(mod.completed_at)}
            />
            <RegenerateModuleButton moduleId={moduleId} />
          </div>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Lesson</h2>
            {sortedCards.map((card) => (
              <Card key={card.id}>
                <CardHeader>
                  <CardDescription className="uppercase tracking-wide">
                    {card.kind.replaceAll("_", " ")}
                  </CardDescription>
                  <CardTitle className="text-base">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {card.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Resources</h2>
            {(resources ?? []).length === 0 ? (
              <p className="text-sm text-zinc-500">
                No external resources attached for this module.
              </p>
            ) : (
              <ul className="space-y-2">
                {resources!.map((r) => (
                  <li key={r.id}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-zinc-200 px-4 py-3 hover:border-teal-400 dark:border-zinc-800"
                    >
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-zinc-500">
                        {r.kind}
                        {r.provider ? ` · ${r.provider}` : ""}
                      </p>
                      {r.snippet ? (
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                          {r.snippet}
                        </p>
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <QuizBlock
            items={(quizItems ?? []).map((q) => ({
              id: q.id,
              prompt: q.prompt,
              choices: (q.choices as string[]) ?? [],
            }))}
          />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Your notes</h2>
            <NotesEditor moduleId={moduleId} initial={note?.body ?? ""} />
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Tutor</h2>
            <TutorChat moduleId={moduleId} initialMessages={initialMessages} />
          </section>
        </>
      ) : null}
    </div>
  );
}
