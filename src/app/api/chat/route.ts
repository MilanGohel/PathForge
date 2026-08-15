import { streamText } from "ai";
import { getGateway, strongModel } from "@/lib/ai/models";
import { buildTutorSystemPrompt } from "@/lib/learning/generation";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    moduleId?: string;
    messages?: Array<{ role: "user" | "assistant"; content: string }>;
    challengeMode?: boolean;
  };

  if (!body.moduleId || !body.messages?.length) {
    return Response.json({ error: "moduleId and messages required" }, { status: 400 });
  }

  const { data: mod } = await supabase
    .from("modules")
    .select("*, stages(*, paths(*)), lessons(mdx, cards)")
    .eq("id", body.moduleId)
    .single();

  if (!mod) {
    return Response.json({ error: "Module not found" }, { status: 404 });
  }

  const stage = mod.stages as {
    id: string;
    title: string;
    paths: { id: string; user_id: string; title: string | null; topic: string };
  };

  if (stage.paths.user_id !== user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const lessonRel = mod.lessons as
    | { mdx?: string; cards: unknown }
    | { mdx?: string; cards: unknown }[]
    | null;
  const lesson = Array.isArray(lessonRel) ? lessonRel[0] : lessonRel;
  const lessonMdx = (lesson?.mdx as string | undefined) ?? "";
  const cardsJson = JSON.stringify(lesson?.cards ?? [], null, 0);

  // Ensure thread
  let threadId: string;
  const { data: existing } = await supabase
    .from("tutor_threads")
    .select("id")
    .eq("module_id", body.moduleId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    threadId = existing.id;
  } else {
    const { data: created, error } = await supabase
      .from("tutor_threads")
      .insert({ module_id: body.moduleId, user_id: user.id })
      .select("id")
      .single();
    if (error || !created) {
      return Response.json(
        { error: error?.message ?? "Failed to create thread" },
        { status: 500 },
      );
    }
    threadId = created.id;
  }

  const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
  if (lastUser) {
    await supabase.from("tutor_messages").insert({
      thread_id: threadId,
      role: "user",
      content: lastUser.content,
    });
  }

  const gateway = getGateway();
  const result = streamText({
    model: gateway(strongModel()),
    system: buildTutorSystemPrompt({
      pathTitle: stage.paths.title ?? stage.paths.topic,
      stageTitle: stage.title,
      moduleTitle: mod.title,
      lessonMdx,
      cardsJson,
      challengeMode: Boolean(body.challengeMode),
    }),
    messages: body.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    async onFinish({ text }) {
      if (text?.trim()) {
        await supabase.from("tutor_messages").insert({
          thread_id: threadId,
          role: "assistant",
          content: text,
        });
      }
    },
  });

  return result.toTextStreamResponse();
}
