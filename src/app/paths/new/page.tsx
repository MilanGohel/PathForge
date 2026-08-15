import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { getPack, listPacks } from "@/lib/packs/ai-engineering";
import { IntakeForm } from "@/components/learning/intake-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default async function NewPathPage({
  searchParams,
}: {
  searchParams: Promise<{ pack?: string }>;
}) {
  const { user } = await requireUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const pack = params.pack ? getPack(params.pack) : null;
  const packs = listPacks();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New learning path</h1>
        <p className="text-sm text-zinc-500">
          Tell us what you want to learn. We&apos;ll place you, then forge stages
          on demand.
        </p>
      </div>

      {!pack ? (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-500">Suggested pack</h2>
          {packs.map((p) => (
            <Link
              key={p.slug}
              href={`/paths/new?pack=${p.slug}`}
              className="block rounded-xl border border-zinc-200 p-4 hover:border-teal-400 dark:border-zinc-800"
            >
              <p className="font-medium">{p.title}</p>
              <p className="text-sm text-zinc-500">{p.description}</p>
            </Link>
          ))}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{pack ? pack.title : "Custom topic"}</CardTitle>
          <CardDescription>
            {pack
              ? "Pack defaults applied. Content is still fully AI-generated after diagnostic."
              : "Free-prompt path — works for any topic."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntakeForm
            defaults={
              pack
                ? {
                    topic: pack.intakeDefaults.topic,
                    goal: pack.intakeDefaults.goal,
                    hoursPerWeek: pack.intakeDefaults.hoursPerWeek,
                    packSlug: pack.slug,
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
