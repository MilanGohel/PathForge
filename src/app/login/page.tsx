import { LoginButtons } from "./login-buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Sign in to Pathforge</CardTitle>
          <CardDescription>
            Production auth via Supabase — Google or GitHub.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params.error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
              {params.error}
            </p>
          ) : null}
          <LoginButtons next={params.next ?? "/dashboard"} />
          <p className="text-xs text-zinc-500">
            Configure OAuth providers in your Supabase project and set{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            +{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            in{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">
              .env.local
            </code>
            . Callback URL:{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">
              {"{SITE}/auth/callback"}
            </code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
