import { LoginButtons } from "./login-buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrandMark } from "@/components/brand-mark";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <BrandMark />
        <p className="mt-3 text-sm text-muted">Welcome back</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sign in to Pathforge</CardTitle>
          <CardDescription>
            Continue with Google or GitHub to save paths, progress, and notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params.error ? (
            <p className="rounded-lg border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger-fg">
              {params.error}
            </p>
          ) : null}
          <LoginButtons next={params.next ?? "/dashboard"} />
          <p className="text-xs leading-relaxed text-muted">
            Use Google or GitHub via Supabase Auth. After sign-in you&apos;ll
            land on your dashboard (or the page you were heading to).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
