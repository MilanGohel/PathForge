import { createClient } from "@/lib/supabase/server";
import {
  getModuleL2Status,
  runEnsureModuleL2,
} from "@/lib/learning/ensure-l2-core";

/** Long lesson generation — allow up to 5 minutes on hosts that honor this. */
export const maxDuration = 300;

/**
 * POST — start/await L2 generation for a module.
 * Body: { moduleId, regenerate?, direction? }
 *
 * GET — poll status: ?moduleId=
 *
 * Uses a plain fetch API (not a server action) so a long-running generation
 * cannot abort App Router navigation and dump the user back to the stage list.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    moduleId?: string;
    regenerate?: boolean;
    direction?: string | null;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.moduleId) {
    return Response.json({ error: "moduleId required" }, { status: 400 });
  }

  const result = await runEnsureModuleL2(supabase, user, body.moduleId, {
    regenerate: Boolean(body.regenerate),
    direction: body.direction,
  });

  if (!result.ok) {
    return Response.json(
      { error: result.error, status: result.status ?? "error" },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, status: result.status });
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const moduleId = new URL(req.url).searchParams.get("moduleId");
  if (!moduleId) {
    return Response.json({ error: "moduleId required" }, { status: 400 });
  }

  const result = await getModuleL2Status(supabase, user, moduleId);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 404 });
  }

  return Response.json({
    ok: true,
    status: result.status,
    errorMessage: result.errorMessage,
  });
}
