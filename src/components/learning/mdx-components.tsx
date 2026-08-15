import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "tip" | "warn" | string;
  children?: ReactNode;
}) {
  const t = (type || "info").toLowerCase();
  return (
    <div
      className={cn(
        "my-4 rounded-xl border px-4 py-3 text-sm leading-relaxed",
        t === "warn" || t === "warning"
          ? "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
          : t === "tip"
            ? "border-teal-200 bg-teal-50 text-teal-950 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-100"
            : "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100",
      )}
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-70">
        {t === "warn" || t === "warning" ? "Watch out" : t === "tip" ? "Tip" : "Note"}
      </p>
      <div className="[&>p]:m-0">{children}</div>
    </div>
  );
}

export function Steps({ children }: { children?: ReactNode }) {
  return (
    <div className="my-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Steps
      </p>
      <div className="prose-steps text-sm leading-relaxed [&>ol]:my-0 [&>ol]:list-decimal [&>ol]:pl-5 [&>ul]:my-0">
        {children}
      </div>
    </div>
  );
}

function Pre(props: ComponentPropsWithoutRef<"pre">) {
  return (
    <pre
      {...props}
      className={cn(
        "my-4 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-sm text-zinc-100 dark:border-zinc-800",
        props.className,
      )}
    />
  );
}

function Code(props: ComponentPropsWithoutRef<"code">) {
  const isBlock = Boolean(props.className?.includes("language-"));
  if (isBlock) {
    return <code {...props} className={cn("font-mono text-[13px]", props.className)} />;
  }
  return (
    <code
      {...props}
      className={cn(
        "rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-zinc-800",
        props.className,
      )}
    />
  );
}

export const lessonMdxComponents = {
  Callout,
  Steps,
  pre: Pre,
  code: Code,
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      className={cn(
        "mt-8 mb-3 border-b border-zinc-100 pb-2 text-xl font-semibold tracking-tight first:mt-0 dark:border-zinc-800",
        props.className,
      )}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      {...props}
      className={cn("mt-6 mb-2 text-lg font-semibold", props.className)}
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p {...props} className={cn("my-3 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300", props.className)} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul {...props} className={cn("my-3 list-disc space-y-1 pl-5 text-[15px] leading-7", props.className)} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol {...props} className={cn("my-3 list-decimal space-y-1 pl-5 text-[15px] leading-7", props.className)} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      {...props}
      className={cn("font-medium text-teal-700 underline-offset-2 hover:underline dark:text-teal-300", props.className)}
      target="_blank"
      rel="noreferrer"
    />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      {...props}
      className={cn(
        "my-4 border-l-4 border-teal-500/50 pl-4 text-zinc-600 italic dark:text-zinc-400",
        props.className,
      )}
    />
  ),
};
