"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPack } from "@/lib/packs/ai-engineering";
import { createClient, requireUser } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { scoreDiagnostic } from "./diagnostic";
import { BudgetExceededError } from "./generation";
import { createSupabaseBudgetStore } from "./budget-store";
import { presentBudgetWarning } from "./budget-warning";
import { getLearningGeneration } from "./service";
import type { DiagnosticAnswer, DiagnosticQuestion } from "@/types/domain";

async function ensureAuth() {
  const { supabase, user } = await requireUser();
  if (!user) {
    redirect("/login");
  }
  return { supabase, user };
}

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function createPathDraft(input: {
  topic: string;
  goal: string;
  hoursPerWeek: number;
  deadline?: string | null;
  packSlug?: string | null;
}): Promise<ActionResult<{ pathId: string }>> {
  const { supabase, user } = await ensureAuth();
  const pack = input.packSlug ? getPack(input.packSlug) : null;

  // Deactivate other actives — v0 optimizes one active path UX
  await supabase
    .from("paths")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("is_active", true);

  const { data, error } = await supabase
    .from("paths")
    .insert({
      user_id: user.id,
      source: pack ? "pack" : "prompt",
      pack_slug: pack?.slug ?? null,
      topic: input.topic.trim(),
      goal: input.goal.trim(),
      hours_per_week: input.hoursPerWeek,
      deadline: input.deadline || null,
      status: "diagnostic",
      is_active: true,
      title: input.topic.trim(),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Failed to create path" };
  }

  // Analytics is fail-open; dynamic import keeps edge bundles light if unused
  try {
    const { track } = await import("@/lib/analytics");
    track("path_created", { pathId: data.id });
  } catch {
    /* ignore */
  }

  return { ok: true, data: { pathId: data.id } };
}

export async function getDiagnosticQuestions(pathId: string): Promise<
  ActionResult<{ questions: DiagnosticQuestion[]; fromPack: boolean }>
> {
  const { supabase, user } = await ensureAuth();
  const { data: path, error } = await supabase
    .from("paths")
    .select("*")
    .eq("id", pathId)
    .eq("user_id", user.id)
    .single();

  if (error || !path) {
    return { ok: false, error: "Path not found" };
  }

  // Pack bank is static — free, no cache row needed
  if (path.pack_slug) {
    const pack = getPack(path.pack_slug);
    if (pack) {
      return {
        ok: true,
        data: { questions: pack.diagnosticBank, fromPack: true },
      };
    }
  }

  // Cache hit: never re-call the Gateway for the same path's quiz
  const cached = path.diagnostic_questions as DiagnosticQuestion[] | null;
  if (Array.isArray(cached) && cached.length > 0) {
    return { ok: true, data: { questions: cached, fromPack: false } };
  }

  try {
    const gen = await getLearningGeneration();
    const questions = await gen.createDiagnosticQuestions(user.id, {
      topic: path.topic,
      goal: path.goal,
    });

    const { error: saveErr } = await supabase
      .from("paths")
      .update({ diagnostic_questions: questions })
      .eq("id", path.id)
      .eq("user_id", user.id);

    if (saveErr) {
      // Still return questions; next load may regenerate if save failed
      console.warn("[diagnostic] failed to cache questions", saveErr.message);
    }

    return { ok: true, data: { questions, fromPack: false } };
  } catch (e) {
    const message =
      e instanceof BudgetExceededError
        ? e.message
        : e instanceof Error
          ? e.message
          : "Failed to generate diagnostic";
    return { ok: false, error: message };
  }
}

export async function submitDiagnosticAndGenerateL0(input: {
  pathId: string;
  questions: DiagnosticQuestion[];
  answers: DiagnosticAnswer[];
}): Promise<ActionResult<{ pathId: string }>> {
  const { supabase, user } = await ensureAuth();
  const { data: path, error } = await supabase
    .from("paths")
    .select("*")
    .eq("id", input.pathId)
    .eq("user_id", user.id)
    .single();

  if (error || !path) {
    return { ok: false, error: "Path not found" };
  }

  const diagnostic = scoreDiagnostic(input.questions, input.answers);

  await supabase
    .from("paths")
    .update({
      status: "generating_l0",
      diagnostic_result: diagnostic,
      error_message: null,
    })
    .eq("id", path.id);

  try {
    const gen = await getLearningGeneration();
    const l0 = await gen.createL0(user.id, {
      intake: {
        topic: path.topic,
        goal: path.goal,
        hoursPerWeek: Number(path.hours_per_week),
        deadline: path.deadline,
        packSlug: path.pack_slug,
      },
      diagnostic,
    });

    const stageRows = l0.stages.map((s, i) => ({
      path_id: path.id,
      position: i,
      title: s.title,
      summary: s.summary,
      est_hours: s.estHours,
      l1_status: "pending",
    }));

    // Clear any partial stages from a previous failed attempt
    await supabase.from("stages").delete().eq("path_id", path.id);

    const { error: stageErr } = await supabase.from("stages").insert(stageRows);
    if (stageErr) throw stageErr;

    const { error: pathErr } = await supabase
      .from("paths")
      .update({
        status: "ready",
        title: l0.title,
        summary: l0.summary,
        est_hours: l0.estHours,
        domain_alert: l0.domainAlert,
        l0_payload: l0,
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", path.id);

    if (pathErr) throw pathErr;

    revalidatePath("/dashboard");
    revalidatePath(`/paths/${path.id}`);
    return { ok: true, data: { pathId: path.id } };
  } catch (e) {
    const message =
      e instanceof BudgetExceededError
        ? e.message
        : e instanceof Error
          ? e.message
          : "L0 generation failed";
    await supabase
      .from("paths")
      .update({ status: "error", error_message: message })
      .eq("id", path.id);
    return { ok: false, error: message };
  }
}

export async function ensureStageL1(
  stageId: string,
  opts?: { regenerate?: boolean },
): Promise<ActionResult> {
  const { supabase, user } = await ensureAuth();

  const { data: stage, error } = await supabase
    .from("stages")
    .select("*, paths(*)")
    .eq("id", stageId)
    .single();

  if (error || !stage) {
    return { ok: false, error: "Stage not found" };
  }

  const path = stage.paths as {
    id: string;
    user_id: string;
    title: string | null;
    topic: string;
    diagnostic_result: unknown;
  };

  if (path.user_id !== user.id) {
    return { ok: false, error: "Forbidden" };
  }

  if (stage.l1_status === "ready" && !opts?.regenerate) {
    return { ok: true, data: undefined };
  }

  await supabase
    .from("stages")
    .update({ l1_status: "generating", error_message: null })
    .eq("id", stageId);

  try {
    const gen = await getLearningGeneration();
    const l1 = await gen.createL1(user.id, stageId, {
      pathTitle: path.title ?? path.topic,
      topic: path.topic,
      stageTitle: stage.title,
      stageSummary: stage.summary,
      diagnostic: (path.diagnostic_result as never) ?? null,
    });

    if (opts?.regenerate) {
      await supabase.from("modules").delete().eq("stage_id", stageId);
    }

    const { error: modErr } = await supabase.from("modules").insert(
      l1.modules.map((m, i) => ({
        stage_id: stageId,
        position: i,
        title: m.title,
        blurb: m.blurb,
        est_minutes: m.estMinutes,
        l2_status: "pending",
      })),
    );
    if (modErr) throw modErr;

    await supabase
      .from("stages")
      .update({
        l1_status: "ready",
        l1_payload: l1,
        error_message: null,
      })
      .eq("id", stageId);

    revalidatePath(`/paths/${path.id}`);
    revalidatePath(`/paths/${path.id}/stages/${stageId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "L1 generation failed";
    await supabase
      .from("stages")
      .update({ l1_status: "error", error_message: message })
      .eq("id", stageId);
    return { ok: false, error: message };
  }
}

/**
 * Prefer POST /api/modules/ensure-l2 from the client for first-open generation
 * (avoids long server-action navigation glitches). Kept for regenerate and
 * any remaining action callers.
 */
export async function ensureModuleL2(
  moduleId: string,
  opts?: { regenerate?: boolean; direction?: string | null },
): Promise<ActionResult> {
  const { supabase, user } = await ensureAuth();
  const { runEnsureModuleL2 } = await import("./ensure-l2-core");
  const result = await runEnsureModuleL2(supabase, user, moduleId, opts);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, data: undefined };
}

export async function markModuleComplete(
  moduleId: string,
  complete: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await ensureAuth();

  const { data: mod } = await supabase
    .from("modules")
    .select("id, stages(paths(id, user_id))")
    .eq("id", moduleId)
    .single();

  const stage = mod?.stages as
    | { paths: { id: string; user_id: string } }
    | null
    | undefined;
  if (!stage || stage.paths.user_id !== user.id) {
    return { ok: false, error: "Forbidden" };
  }

  const { error } = await supabase
    .from("modules")
    .update({
      completed_at: complete ? new Date().toISOString() : null,
    })
    .eq("id", moduleId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/paths/${stage.paths.id}`);
  revalidatePath(`/paths/${stage.paths.id}/modules/${moduleId}`);
  revalidatePath("/dashboard");
  return { ok: true, data: undefined };
}

export async function saveModuleNote(
  moduleId: string,
  body: string,
): Promise<ActionResult> {
  const { supabase, user } = await ensureAuth();

  const { error } = await supabase.from("module_notes").upsert(
    {
      module_id: moduleId,
      user_id: user.id,
      body,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "module_id,user_id" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function submitQuizAnswer(input: {
  quizItemId: string;
  choiceIndex: number;
}): Promise<ActionResult<{ isCorrect: boolean; explanation: string }>> {
  const { supabase, user } = await ensureAuth();

  const { data: item, error } = await supabase
    .from("quiz_items")
    .select("*")
    .eq("id", input.quizItemId)
    .single();

  if (error || !item) {
    return { ok: false, error: "Quiz item not found" };
  }

  const isCorrect = item.correct_index === input.choiceIndex;

  await supabase.from("quiz_attempts").insert({
    quiz_item_id: item.id,
    user_id: user.id,
    choice_index: input.choiceIndex,
    is_correct: isCorrect,
  });

  return {
    ok: true,
    data: { isCorrect, explanation: item.explanation as string },
  };
}

export async function setActivePath(pathId: string): Promise<ActionResult> {
  const { supabase, user } = await ensureAuth();

  await supabase
    .from("paths")
    .update({ is_active: false })
    .eq("user_id", user.id);

  const { error } = await supabase
    .from("paths")
    .update({ is_active: true })
    .eq("id", pathId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true, data: undefined };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/** Soft budget status for UI warnings (does not enforce). */
export async function getGenerationBudgetStatus(): Promise<
  ActionResult<{
    used: number;
    limit: number;
    remaining: number;
    level: "ok" | "warn" | "blocked";
  }>
> {
  const { supabase, user } = await ensureAuth();
  const store = createSupabaseBudgetStore(supabase);
  const used = await store.countToday(user.id);
  const limit = env.generationDailyBudget();
  const view = presentBudgetWarning({ used, limit });
  return { ok: true, data: view };
}

/** Export all notes for a path as markdown (owner only). */
export async function exportPathNotesMarkdown(
  pathId: string,
): Promise<ActionResult<{ markdown: string; filename: string }>> {
  const { supabase, user } = await ensureAuth();

  const { data: path } = await supabase
    .from("paths")
    .select("id, title, topic, user_id")
    .eq("id", pathId)
    .eq("user_id", user.id)
    .single();

  if (!path) return { ok: false, error: "Path not found" };

  const { data: stages } = await supabase
    .from("stages")
    .select("id, title, position")
    .eq("path_id", pathId)
    .order("position");

  const stageIds = (stages ?? []).map((s) => s.id);
  if (!stageIds.length) {
    return {
      ok: true,
      data: {
        markdown: `# Notes — ${path.title ?? path.topic}\n\n_No modules yet._\n`,
        filename: "pathforge-notes.md",
      },
    };
  }

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, position, stage_id")
    .in("stage_id", stageIds);

  const { data: notes } = await supabase
    .from("module_notes")
    .select("module_id, body, updated_at")
    .eq("user_id", user.id)
    .in(
      "module_id",
      (modules ?? []).map((m) => m.id),
    );

  const noteByModule = new Map((notes ?? []).map((n) => [n.module_id, n]));
  const stageById = new Map((stages ?? []).map((s) => [s.id, s]));

  const sorted = [...(modules ?? [])].sort((a, b) => {
    const sa = stageById.get(a.stage_id)?.position ?? 0;
    const sb = stageById.get(b.stage_id)?.position ?? 0;
    if (sa !== sb) return sa - sb;
    return a.position - b.position;
  });

  const lines: string[] = [
    `# Notes — ${path.title ?? path.topic}`,
    "",
    `_Exported from Pathforge_`,
    "",
  ];

  let any = false;
  for (const m of sorted) {
    const note = noteByModule.get(m.id);
    if (!note?.body?.trim()) continue;
    any = true;
    const st = stageById.get(m.stage_id);
    lines.push(`## ${m.title}`);
    if (st) lines.push(`*${st.title}*`);
    lines.push("");
    lines.push(note.body.trim());
    lines.push("");
  }

  if (!any) {
    lines.push("_No notes saved on this path yet._");
    lines.push("");
  }

  const slug = (path.title ?? path.topic)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  return {
    ok: true,
    data: {
      markdown: lines.join("\n"),
      filename: `pathforge-notes-${slug || "path"}.md`,
    },
  };
}
