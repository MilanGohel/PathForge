"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { track } from "@/lib/analytics";
import { presentTutorSuggestions } from "@/lib/learning/tutor-suggestions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export function TutorChat({
  moduleId,
  initialMessages = [],
  lessonTitles = [],
}: {
  moduleId: string;
  initialMessages?: Msg[];
  /** H2 titles from the open lesson — used for empty-state suggestions. */
  lessonTitles?: string[];
}) {
  const suggestions = presentTutorSuggestions(lessonTitles);
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [challenge, setChallenge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastUserRef = useRef<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setCollapsed(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  async function send(text: string, challengeMode = challenge) {
    if (!text.trim() || loading) return;
    const userText = text.trim();
    const nextMessages: Msg[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(nextMessages);
    setInput("");
    await sendWithHistory(nextMessages, challengeMode);
  }

  function stop() {
    abortRef.current?.abort();
  }

  function retryLast() {
    if (loading || !lastUserRef.current) return;
    const t = lastUserRef.current;
    setMessages((m) => {
      const copy = [...m];
      if (copy.length && copy[copy.length - 1]?.role === "assistant") {
        copy.pop();
      }
      if (copy.length && copy[copy.length - 1]?.role === "user") {
        copy.pop();
      }
      // Rebuild send from cleaned history without racing setState
      const nextMessages = [
        ...copy,
        { role: "user" as const, content: t },
      ];
      queueMicrotask(() => void sendWithHistory(nextMessages, challenge));
      return nextMessages;
    });
  }

  async function sendWithHistory(
    nextMessages: Msg[],
    challengeMode = challenge,
  ) {
    if (loading) return;
    setError(null);
    const lastUser = [...nextMessages].reverse().find((m) => m.role === "user");
    if (lastUser) lastUserRef.current = lastUser.content;
    setLoading(true);
    track("tutor_message", { moduleId });

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          messages: nextMessages,
          challengeMode,
        }),
        signal: ac.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Chat failed (${res.status})`);
      }
      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistant = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistant += decoder.decode(value, { stream: true });
        const snapshot = assistant;
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: snapshot };
          return copy;
        });
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        setError("Generation stopped");
      } else {
        setError(e instanceof Error ? e.message : "Chat failed");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  async function copyText(content: string) {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      /* ignore */
    }
  }

  if (collapsed) {
    return (
      <div className="fixed right-4 bottom-4 z-40 md:hidden">
        <Button
          type="button"
          className="shadow-md"
          onClick={() => setCollapsed(false)}
        >
          Ask tutor
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex h-[420px] flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Module tutor</p>
          <p className="text-xs text-muted">Grounded on this lesson only</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            variant={challenge ? "default" : "outline"}
            disabled={loading}
            onClick={() => {
              const next = !challenge;
              setChallenge(next);
              if (next && !loading) {
                void send("Challenge me with one practice question.", true);
              }
            }}
          >
            Challenge me
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="md:hidden"
            type="button"
            onClick={() => setCollapsed(true)}
          >
            Hide
          </Button>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Ask anything about this module, or try a suggestion.
            </p>
            <div className="flex flex-col gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={loading}
                  className="rounded-lg border border-border bg-muted-bg/50 px-3 py-2 text-left text-sm hover:border-primary/40"
                  onClick={() => void send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "group relative max-w-[90%] rounded-xl px-3 py-2 text-sm",
              m.role === "user"
                ? "ml-auto bg-primary text-white"
                : "bg-muted-bg",
            )}
          >
            {m.role === "assistant" ? (
              <div className="prose-tutor [&_p]:my-1 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-zinc-950 [&_pre]:p-2 [&_pre]:text-zinc-100 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content || (loading && i === messages.length - 1 ? "…" : "")}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{m.content}</p>
            )}
            {m.role === "assistant" && m.content ? (
              <button
                type="button"
                className="absolute top-1 right-1 rounded px-1.5 py-0.5 text-[10px] text-muted opacity-0 hover:bg-card group-hover:opacity-100"
                onClick={() => void copyText(m.content)}
              >
                Copy
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {error ? (
        <p className="px-4 text-xs text-danger-fg" role="status">
          {error}
        </p>
      ) : null}
      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {loading ? (
            <Button type="button" size="sm" variant="outline" onClick={stop}>
              Stop
            </Button>
          ) : lastUserRef.current ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => retryLast()}
            >
              Retry last
            </Button>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the tutor…"
            className="min-h-[44px]"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
          />
          <Button disabled={loading || !input.trim()} onClick={() => void send(input)}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
