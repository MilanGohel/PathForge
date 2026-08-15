import type { Metadata } from "next";
import Link from "next/link";
import { listPacks } from "@/lib/packs/ai-engineering";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pathforge — AI learning paths that teach",
  description:
    "A personal learning path with real lessons, optional resources, progress, and a tutor grounded in what you’re studying.",
  openGraph: {
    title: "Pathforge — AI learning paths that teach",
    description:
      "Build a path for any topic, learn module by module, and go deeper when you want to.",
  },
};

const PROOF = [
  {
    t: "Built around your goal",
    d: "Tell us what you want and how much time you have — your path matches your level.",
  },
  {
    t: "Lessons that actually teach",
    d: "Each module is a clear, readable lesson you can learn from on its own.",
  },
  {
    t: "Help when you’re stuck",
    d: "Notes, a light quiz, and a tutor that stays on this module — not the whole internet.",
  },
];

const STEPS = [
  {
    n: "01",
    t: "Share your goal",
    d: "What you want to learn, why it matters, and how many hours a week you can give it.",
  },
  {
    n: "02",
    t: "Find your starting point",
    d: "A short placement quiz so the path doesn’t waste time on what you already know.",
  },
  {
    n: "03",
    t: "Follow a clear roadmap",
    d: "Stages break the journey into sensible chunks. Open the next one when you’re ready.",
  },
  {
    n: "04",
    t: "Learn one module at a time",
    d: "A full lesson, optional practice, your notes, and a tutor grounded in that module.",
  },
];

const FEATURES = [
  {
    t: "A path that fits you",
    d: "Stages and modules shaped by your goal and placement — not a one-size syllabus.",
  },
  {
    t: "Today’s next step",
    d: "Always know what to open next. Mark modules complete when you’re done — no quiz gates.",
  },
  {
    t: "Go deeper on your terms",
    d: "A few hand-picked external links when you want more. The lesson stands alone without them.",
  },
];

const FAQ = [
  {
    q: "What do I get for each module?",
    a: "A teachable lesson with a clear outline, an optional short quiz, space for notes, a few curated links if you want them, and a tutor that only talks about this module.",
  },
  {
    q: "What’s the AI Engineering pack?",
    a: "A ready-made starting point with sensible defaults and a placement quiz for that topic. You can also start any custom topic after you sign in.",
  },
  {
    q: "Do I need the external links to learn?",
    a: "No. Each module is written so you can learn from the lesson itself. Links are optional “go deeper” material.",
  },
  {
    q: "How do I know what to study next?",
    a: "Your dashboard highlights today’s module. Finish at your own pace and open the next one when you’re ready.",
  },
];

function PathMock() {
  return (
    <div
      className="rounded-2xl border border-border bg-card p-5 shadow-md sm:p-6"
      style={{ boxShadow: "var(--shadow-md)" }}
      aria-hidden
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Path overview
          </p>
          <p className="mt-1 font-semibold tracking-tight">
            AI Engineering foundations
          </p>
        </div>
        <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary-soft-fg">
          Active
        </span>
      </div>
      <ul className="space-y-2">
        {[
          { t: "LLM mental models", s: "3 of 4 modules done", ready: true },
          { t: "Prompting & evaluation", s: "Up next", ready: false },
          { t: "RAG systems", s: "Later", ready: false },
        ].map((row) => (
          <li
            key={row.t}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5"
          >
            <div>
              <p className="text-sm font-medium">{row.t}</p>
              <p className="text-xs text-muted">{row.s}</p>
            </div>
            <span
              className={
                row.ready
                  ? "text-xs font-medium text-primary"
                  : "text-xs text-muted"
              }
            >
              {row.ready ? "Open" : "Soon"}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-xl border border-border bg-muted-bg/60 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Module lesson
        </p>
        <p className="mt-1 text-sm font-medium">Why context windows matter</p>
        <div className="mt-2 space-y-1.5">
          {[
            "Why context windows bite",
            "The sliding window model",
            "A truncation walkthrough",
          ].map((h) => (
            <div key={h} className="flex items-center gap-2 text-xs text-muted">
              <span className="h-1 w-1 rounded-full bg-primary" />
              {h}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const packs = listPacks();

  return (
    <div className="pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-25"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, var(--primary-soft), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center animate-fade-up">
            <p className="mb-4 text-sm font-medium text-primary">
              Learn anything with a path that remembers you
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.1]">
              Your personal curriculum, forged for how you learn
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Pathforge builds a staged roadmap for whatever you want to learn,
              then walks you through it one module at a time — real lessons, a
              few quality resources, clear progress, and a tutor that stays on
              topic.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex h-12 items-center rounded-md bg-primary px-6 text-base font-semibold text-white shadow-sm hover:bg-primary-hover"
              >
                Start learning
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-12 items-center rounded-xl border border-border px-6 text-base font-medium hover:bg-muted-bg"
              >
                How it works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Proof strip */}
      <section className="border-b border-border bg-muted-bg/30">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6">
          {PROOF.map((p) => (
            <div key={p.t} className="text-center sm:text-left">
              <p className="font-medium tracking-tight">{p.t}</p>
              <p className="mt-1 text-sm text-muted">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              How it works
            </h2>
            <p className="mt-3 text-muted">
              From goal to next lesson — a simple loop you can trust.
            </p>
          </div>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <span className="text-xs font-semibold tracking-widest text-primary">
                  {s.n}
                </span>
                <h3 className="mt-2 font-semibold tracking-tight">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-muted-bg/20">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Built for real learning
            </h2>
            <p className="mt-3 text-muted">
              Structure when you need it. Depth when the topic deserves it.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.t}>
                <CardHeader>
                  <CardTitle>{f.t}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {f.d}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Static mock */}
      <section>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              See the shape of a path
            </h2>
            <p className="mt-3 text-muted leading-relaxed">
              Stages group related modules. Each lesson has a topic-specific
              outline you can scan — and jump around while you read.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                Always know your next module
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                Mark complete when you&apos;re ready — no quiz gates
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                Tutor grounded in the lesson you&apos;re on
              </li>
            </ul>
          </div>
          <PathMock />
        </div>
      </section>

      {/* Pack CTA */}
      <section className="border-t border-border bg-muted-bg/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Start with a pack
          </h2>
          <p className="mt-2 max-w-xl text-muted">
            Suggested starting points with sensible defaults. Or pick any topic
            you care about.
          </p>
          <div className="mt-8 grid gap-4">
            {packs.map((pack) => (
              <Card key={pack.slug} className="border-primary/20">
                <CardHeader>
                  <CardTitle>{pack.title}</CardTitle>
                  <CardDescription>{pack.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/paths/new?pack=${pack.slug}`}
                    className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
                  >
                    Start {pack.title}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">
            Or{" "}
            <Link
              href="/paths/new"
              className="font-medium text-primary hover:underline"
            >
              start any custom topic
            </Link>{" "}
            after sign-in.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-center font-display text-3xl font-semibold tracking-tight">
            FAQ
          </h2>
          <dl className="mt-10 space-y-6">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-border bg-card px-5 py-4"
              >
                <dt className="font-medium tracking-tight">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to forge your path?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Sign in and start from AI Engineering or any topic you care about.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-12 items-center rounded-md bg-primary px-6 text-base font-semibold text-white shadow-sm hover:bg-primary-hover"
          >
            Start learning
          </Link>
        </div>
      </section>
    </div>
  );
}
