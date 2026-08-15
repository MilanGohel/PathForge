"use client";

import {
  Children,
  isValidElement,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { MermaidBlock } from "./mermaid-block";

function extractText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return extractText(props.children);
  }
  return "";
}

function languageFromClass(className?: string): string | undefined {
  const m = className?.match(/language-([\w-]+)/);
  return m?.[1];
}

export function PreBlock(props: ComponentPropsWithoutRef<"pre">) {
  const [copied, setCopied] = useState(false);
  const childrenArray = Children.toArray(props.children);
  let lang: string | undefined;
  for (const child of childrenArray) {
    if (isValidElement(child)) {
      const cls = (child.props as { className?: string }).className;
      lang = languageFromClass(cls) ?? lang;
    }
  }
  const text = extractText(props.children);

  if (lang === "mermaid") {
    return <MermaidBlock source={text} />;
  }

  return (
    <div className="group relative my-4">
      <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-border bg-zinc-900 px-3 py-1.5">
        <span className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
          {lang || "code"}
        </span>
        <button
          type="button"
          className="rounded px-2 py-0.5 text-[11px] text-zinc-300 hover:bg-zinc-800 hover:text-white"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            } catch {
              /* ignore */
            }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        {...props}
        className={cn(
          "overflow-x-auto rounded-b-xl rounded-t-none border border-border bg-zinc-950 p-4 text-sm text-zinc-100",
          props.className,
        )}
      />
    </div>
  );
}
