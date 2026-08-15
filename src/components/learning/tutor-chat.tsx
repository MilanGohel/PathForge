"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Msg = { role: "user" | "assistant"; content: string };

export function TutorChat({
  moduleId,
  initialMessages = [],
}: {
  moduleId: string;
  initialMessages?: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [challenge, setChallenge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(text: string, challengeMode = challenge) {
    if (!text.trim() || loading) return;
    setError(null);
    const nextMessages: Msg[] = [
      ...messages,
      { role: "user", content: text.trim() },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          messages: nextMessages,
          challengeMode,
        }),
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
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[420px] flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div>
          <p className="text-sm font-semibold">Module tutor</p>
          <p className="text-xs text-zinc-500">Grounded on this lesson only</p>
        </div>
        <Button
          size="sm"
          variant={challenge ? "default" : "outline"}
          onClick={() => {
            setChallenge((c) => !c);
            if (!challenge) {
              void send("Challenge me with one practice question.", true);
            }
          }}
        >
          Challenge me
        </Button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Ask anything about this module, or hit Challenge me.
          </p>
        ) : null}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-teal-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-900"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
      </div>
      {error ? (
        <p className="px-4 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the tutor…"
            className="min-h-[44px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
          />
          <Button disabled={loading} onClick={() => void send(input)}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
