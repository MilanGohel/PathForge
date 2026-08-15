"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Client-only Mermaid renderer.
 * Lazy-loads mermaid; on failure falls back to code-block chrome + hint.
 */
export function MermaidBlock({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => setDark(root.classList.contains("dark"));
    apply();
    const obs = new MutationObserver(apply);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const text = source.trim();
    if (!text) {
      setFailed(true);
      setPending(false);
      return;
    }

    setPending(true);
    setFailed(false);
    setSvg(null);

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: dark ? "dark" : "neutral",
          fontFamily: "inherit",
        });
        const id = `mermaid-${reactId}-${Math.abs(hashCode(text))}-${dark ? "d" : "l"}`;
        const { svg: rendered } = await mermaid.render(id, text);
        if (!cancelled) {
          setSvg(rendered);
          setPending(false);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
          setPending(false);
          setSvg(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source, reactId, dark]);

  if (failed) {
    return (
      <div className={cn("my-4", className)}>
        <p className="mb-1 text-xs text-muted">Diagram could not be rendered</p>
        <div className="group relative">
          <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-border bg-zinc-900 px-3 py-1.5">
            <span className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
              mermaid
            </span>
            <button
              type="button"
              className="rounded px-2 py-0.5 text-[11px] text-zinc-300 hover:bg-zinc-800 hover:text-white"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(source);
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
          <pre className="overflow-x-auto rounded-b-xl border border-border bg-zinc-950 p-4 text-sm text-zinc-100">
            <code className="font-mono text-[13px]">{source}</code>
          </pre>
        </div>
      </div>
    );
  }

  if (pending || !svg) {
    return (
      <div
        className={cn(
          "my-4 min-h-[4rem] rounded-xl border border-border bg-muted-bg/50 px-4 py-6 text-center text-sm text-muted",
          className,
        )}
        aria-busy="true"
      >
        Loading diagram…
      </div>
    );
  }

  return (
    <div
      className={cn(
        "my-4 overflow-x-auto rounded-xl border border-border bg-card p-4 [&_svg]:mx-auto [&_svg]:max-w-full",
        className,
      )}
      // SVG produced by mermaid with securityLevel: "strict"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}
