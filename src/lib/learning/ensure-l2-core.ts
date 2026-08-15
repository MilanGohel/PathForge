import { revalidatePath } from "next/cache";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeRegenerateDirection } from "./regenerate-direction";
import { getLearningGeneration } from "./service";

export type EnsureL2Result =
  | { ok: true; status: "ready" | "generating" }
  | { ok: false; error: string; status?: "error" };

type StageJoin = {
  id: string;
  title: string;
  paths: {
    id: string;
    user_id: string;
    title: string | null;
    topic: string;
  };
};

/**
 * Generate (or regenerate) L2 lesson content for a module.
 * Safe to call from Route Handlers — does not redirect.
 *
 * If another request is already generating and this is not a regenerate,
 * returns { ok: true, status: "generating" } so the client can poll.
 */
export async function runEnsureModuleL2(
  supabase: SupabaseClient,
  user: User,
  moduleId: string,
  opts?: { regenerate?: boolean; direction?: string | null },
): Promise<EnsureL2Result> {
  const { data: mod, error } = await supabase
    .from("modules")
    .select("*, stages(*, paths(*))")
    .eq("id", moduleId)
    .single();

  if (error || !mod) {
    return { ok: false, error: "Module not found" };
  }

  const stageRaw = mod.stages as unknown;
  const stage = (
    Array.isArray(stageRaw) ? stageRaw[0] : stageRaw
  ) as StageJoin | null | undefined;
  const pathsRaw = stage?.paths as unknown;
  const paths = (
    Array.isArray(pathsRaw) ? pathsRaw[0] : pathsRaw
  ) as StageJoin["paths"] | null | undefined;

  if (!stage || !paths || paths.user_id !== user.id) {
    return { ok: false, error: "Forbidden" };
  }
  // Rebind for the rest of the function
  const ownedStage: StageJoin = { ...stage, paths };

  if (mod.l2_status === "ready" && !opts?.regenerate) {
    return { ok: true, status: "ready" };
  }

  // Another tab/request already cooking — client should poll, not start a second job.
  if (mod.l2_status === "generating" && !opts?.regenerate) {
    return { ok: true, status: "generating" };
  }

  const direction = normalizeRegenerateDirection(opts?.direction);

  await supabase
    .from("modules")
    .update({ l2_status: "generating", error_message: null })
    .eq("id", moduleId);

  try {
    const gen = await getLearningGeneration();
    const l2 = await gen.createL2(user.id, moduleId, {
      topic: ownedStage.paths.topic,
      pathTitle: ownedStage.paths.title ?? ownedStage.paths.topic,
      stageTitle: ownedStage.title,
      moduleTitle: mod.title,
      moduleBlurb: mod.blurb,
      estMinutes: mod.est_minutes,
      direction,
    });

    if (opts?.regenerate) {
      await supabase.from("lessons").delete().eq("module_id", moduleId);
      await supabase.from("resources").delete().eq("module_id", moduleId);
      await supabase.from("quiz_items").delete().eq("module_id", moduleId);
    }

    const { error: lessonErr } = await supabase.from("lessons").upsert({
      module_id: moduleId,
      mdx: l2.mdx,
      cards: [],
      generated_at: new Date().toISOString(),
    });
    if (lessonErr) throw lessonErr;

    if (l2.resources.length) {
      const { error: resErr } = await supabase.from("resources").insert(
        l2.resources.map((r, i) => ({
          module_id: moduleId,
          title: r.title,
          url: r.url,
          kind: r.kind,
          provider: r.provider ?? null,
          snippet: r.snippet ?? null,
          verified: true,
          position: i,
        })),
      );
      if (resErr) throw resErr;
    }

    if (l2.quiz.length) {
      const { error: quizErr } = await supabase.from("quiz_items").insert(
        l2.quiz.map((q, i) => ({
          module_id: moduleId,
          position: i,
          prompt: q.prompt,
          choices: q.choices,
          correct_index: q.correctIndex,
          explanation: q.explanation,
        })),
      );
      if (quizErr) throw quizErr;
    }

    await supabase
      .from("modules")
      .update({ l2_status: "ready", error_message: null })
      .eq("id", moduleId);

    try {
      const { track } = await import("@/lib/analytics");
      track("lesson_ready", { moduleId });
    } catch {
      /* ignore */
    }

    const pathId = ownedStage.paths.id;
    // Module page first — avoid broad path revalidation yanking the client
    // back to a cached stage view mid-flight.
    revalidatePath(`/paths/${pathId}/modules/${moduleId}`);
    revalidatePath(`/paths/${pathId}/stages/${ownedStage.id}`);
    revalidatePath(`/paths/${pathId}`);

    return { ok: true, status: "ready" };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "L2 generation failed";
    await supabase
      .from("modules")
      .update({ l2_status: "error", error_message: message })
      .eq("id", moduleId);
    return { ok: false, error: message, status: "error" };
  }
}

export async function getModuleL2Status(
  supabase: SupabaseClient,
  user: User,
  moduleId: string,
): Promise<
  | { ok: true; status: string; errorMessage: string | null }
  | { ok: false; error: string }
> {
  const { data: mod, error } = await supabase
    .from("modules")
    .select("l2_status, error_message, stages(paths(user_id))")
    .eq("id", moduleId)
    .single();

  if (error || !mod) {
    return { ok: false, error: "Module not found" };
  }

  // Supabase nested select typing is loose; normalize to a single join shape.
  const stageRaw = mod.stages as unknown;
  const stage = (
    Array.isArray(stageRaw) ? stageRaw[0] : stageRaw
  ) as { paths: { user_id: string } | { user_id: string }[] } | null | undefined;
  const pathsRaw = stage?.paths;
  const paths = (
    Array.isArray(pathsRaw) ? pathsRaw[0] : pathsRaw
  ) as { user_id: string } | null | undefined;

  if (!paths || paths.user_id !== user.id) {
    return { ok: false, error: "Forbidden" };
  }

  return {
    ok: true,
    status: mod.l2_status as string,
    errorMessage: (mod.error_message as string | null) ?? null,
  };
}
