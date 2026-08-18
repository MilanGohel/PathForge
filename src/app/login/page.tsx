import Link from "next/link";
import { LoginButtons } from "./login-buttons";
import { BrandMark } from "@/components/brand-mark";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="relative flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center px-4 py-16 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-50 dark:opacity-30"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, var(--primary-soft), transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-[24rem] animate-fade-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-1.5 backdrop-blur-sm"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <BrandMark size="sm" />
            <span className="font-display text-sm font-semibold tracking-tight">
              Pathforge
            </span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
            Welcome back
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
            Sign in to pick up your path, progress, and notes.
          </p>
        </div>

        <div
          className="rounded-2xl border border-border bg-card p-6 sm:p-7"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          {params.error ? (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-danger-border bg-danger-bg px-3 py-2.5 text-sm text-danger-fg"
            >
              {params.error}
            </p>
          ) : null}

          <LoginButtons next={params.next ?? "/dashboard"} />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          New here? The same buttons create your account.
        </p>
      </div>
    </div>
  );
}
