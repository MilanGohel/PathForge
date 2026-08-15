import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { DiagnosticForm } from "@/components/learning/diagnostic-form";

export default async function DiagnosticPage({
  params,
}: {
  params: Promise<{ pathId: string }>;
}) {
  const { pathId } = await params;
  const { supabase, user } = await requireUser();
  if (!user) redirect("/login");

  const { data: path } = await supabase
    .from("paths")
    .select("*")
    .eq("id", pathId)
    .eq("user_id", user.id)
    .single();

  if (!path) notFound();

  if (path.status === "ready") {
    redirect(`/paths/${pathId}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:py-10">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-foreground"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Placement diagnostic
        </h1>
        <p className="mt-1 text-sm text-muted">
          Topic:{" "}
          <span className="font-medium text-foreground">{path.topic}</span>
          {" · "}
          Goal: {path.goal}
        </p>
      </div>
      <DiagnosticForm pathId={pathId} />
    </div>
  );
}
