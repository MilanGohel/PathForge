"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPathDraft } from "@/lib/learning/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function IntakeForm({
  defaults,
}: {
  defaults?: {
    topic?: string;
    goal?: string;
    hoursPerWeek?: number;
    packSlug?: string;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState(defaults?.topic ?? "");
  const [goal, setGoal] = useState(defaults?.goal ?? "");
  const [hours, setHours] = useState(String(defaults?.hoursPerWeek ?? 5));
  const [deadline, setDeadline] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createPathDraft({
        topic,
        goal,
        hoursPerWeek: Number(hours) || 5,
        deadline: deadline || null,
        packSlug: defaults?.packSlug ?? null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/paths/${res.data.pathId}/diagnostic`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="topic">What do you want to learn?</Label>
        <Input
          id="topic"
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. AI Engineering, System Design, Pottery basics"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal">Goal</Label>
        <Textarea
          id="goal"
          required
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Job switch, ship a side project, pass an interview, pure curiosity…"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hours">Hours per week</Label>
          <Input
            id="hours"
            type="number"
            min={1}
            max={40}
            required
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline (optional)</Label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      </div>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Creating…" : "Continue to diagnostic"}
      </Button>
    </form>
  );
}
