import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { slugifyHeading, type TocEntry } from "@/lib/learning/lesson-toc";
import { cn } from "@/lib/utils";
import { PreBlock } from "./code-block";

function headingText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(headingText).join("");
  if (children && typeof children === "object" && "props" in children) {
    const c = children as { props?: { children?: ReactNode } };
    return headingText(c.props?.children);
  }
  return "";
}

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
          ? "border-warning-border bg-warning-bg text-warning-fg"
          : t === "tip"
            ? "border-primary/30 bg-primary-soft/50 text-primary-soft-fg"
            : "border-border bg-muted-bg text-foreground",
      )}
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-70">
        {t === "warn" || t === "warning"
          ? "Watch out"
          : t === "tip"
            ? "Tip"
            : "Note"}
      </p>
      <div className="[&>p]:m-0">{children}</div>
    </div>
  );
}

export function Steps({ children }: { children?: ReactNode }) {
  return (
    <div className="my-4 rounded-xl border border-border bg-muted-bg/60 px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Steps
      </p>
      <div className="prose-steps text-sm leading-relaxed [&>ol]:my-0 [&>ol]:list-decimal [&>ol]:pl-5 [&>ul]:my-0">
        {children}
      </div>
    </div>
  );
}

function Code(props: ComponentPropsWithoutRef<"code">) {
  const isBlock = Boolean(props.className?.includes("language-"));
  if (isBlock) {
    return (
      <code
        {...props}
        className={cn("font-mono text-[13px]", props.className)}
      />
    );
  }
  return (
    <code
      {...props}
      className={cn(
        "rounded bg-muted-bg px-1.5 py-0.5 font-mono text-[0.9em]",
        props.className,
      )}
    />
  );
}

/**
 * Build MDX components. When `toc` is provided, H2 ids match extractLessonToc
 * (including de-duplicated suffixes).
 */
export function createLessonMdxComponents(toc?: TocEntry[]) {
  let h2Index = 0;
  return {
    Callout,
    Steps,
    pre: PreBlock,
    code: Code,
    h2: (props: ComponentPropsWithoutRef<"h2">) => {
      const text = headingText(props.children);
      const fromToc = toc?.[h2Index]?.id;
      h2Index += 1;
      const id = props.id || fromToc || slugifyHeading(text);
      return (
        <h2
          {...props}
          id={id}
          className={cn(
            "mt-8 mb-3 scroll-mt-24 border-b border-border pb-2 text-xl font-semibold tracking-tight first:mt-0",
            props.className,
          )}
        />
      );
    },
    h3: (props: ComponentPropsWithoutRef<"h3">) => (
      <h3
        {...props}
        className={cn("mt-6 mb-2 text-lg font-semibold", props.className)}
      />
    ),
    p: (props: ComponentPropsWithoutRef<"p">) => (
      <p
        {...props}
        className={cn(
          "my-3 text-[15px] leading-7 text-foreground/90",
          props.className,
        )}
      />
    ),
    ul: (props: ComponentPropsWithoutRef<"ul">) => (
      <ul
        {...props}
        className={cn(
          "my-3 list-disc space-y-1 pl-5 text-[15px] leading-7",
          props.className,
        )}
      />
    ),
    ol: (props: ComponentPropsWithoutRef<"ol">) => (
      <ol
        {...props}
        className={cn(
          "my-3 list-decimal space-y-1 pl-5 text-[15px] leading-7",
          props.className,
        )}
      />
    ),
    a: (props: ComponentPropsWithoutRef<"a">) => (
      <a
        {...props}
        className={cn(
          "font-medium text-primary underline-offset-2 hover:underline",
          props.className,
        )}
        target="_blank"
        rel="noreferrer"
      />
    ),
    blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
      <blockquote
        {...props}
        className={cn(
          "my-4 border-l-4 border-primary/50 pl-4 text-muted italic",
          props.className,
        )}
      />
    ),
  };
}

/** Default components without pre-assigned TOC ids. */
export const lessonMdxComponents = createLessonMdxComponents();
