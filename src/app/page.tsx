import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, MessagesSquare, Route } from "lucide-react";
import { PathMock } from "@/components/marketing/path-mock";
import { buttonVariants } from "@/components/ui/button";
import { listPacks } from "@/lib/packs/ai-engineering";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pathforge — Your personal curriculum, forged for how you learn",
  description:
    "Pathforge builds a staged learning roadmap for anything you want to learn, then teaches you one module at a time with real lessons, progress, and a module tutor.",
  openGraph: {
    title: "Pathforge — Your personal curriculum, forged for how you learn",
    description:
      "AI learning paths that teach: staged roadmaps, real module lessons, and a tutor that stays on topic.",
  },
};

const STEPS = [
  {
    n: "01",
    title: "Share your goal",
    body: "Tell Pathforge what you want to be able to do — a job skill, a project, a whole field.",
  },
  {
    n: "02",
    title: "Find your starting point",
    body: "A short placement quiz skips what you already know and sets the right depth.",
  },
  {
    n: "03",
    title: "Follow a clear roadmap",
    body: "Your path is organised into stages, so progress is visible instead of vague.",
  },
  {
    n: "04",
    title: "Learn one module at a time",
    body: "Each module is a full lesson plus practice, with a tutor scoped to what you're reading.",
  },
];

const FEATURES = [
  {
    icon: Route,
    title: "A path that fits you",
    body: "Stages and modules are built around your goal and starting level — not a generic syllabus someone else needed.",
  },
  {
    icon: Compass,
    title: "Today's next step",
    body: "Open the app and the next module is already waiting. Mark it complete when you're genuinely ready; no quiz gates.",
  },
  {
    icon: MessagesSquare,
    title: "Go deeper on your terms",
    body: "A few curated links sit beside every lesson, but the lesson stands alone. Read it and you've learned the thing.",
  },
];

const FAQ = [
  {
    q: "What do I get for each module?",
    a: "A written lesson that teaches the concept end to end, a short practice prompt, space for your notes, a light self-check, and a tutor that only talks about that module.",
  },
  {
    q: "What's the AI Engineering pack?",
    a: "A suggested starting point with sensible defaults for people learning to build with LLMs. It's a well-shaped path you can follow as-is or adjust as you go.",
  },
  {
    q: "Do I need external links to learn?",
    a: "No. Curated links are optional depth. Every lesson is written to be teachable on its own, so you can finish a module without opening a single tab.",
  },
  {
    q: "How do I know what to study next?",
    a: "Pathforge always surfaces one next module based on where you are in your path, so you never have to plan your own study session.",
  },
];

const PROOF = [
  ["Built around your goal", "Placement first, then a path shaped to it."],
  ["Lessons that actually teach", "Written explanations, not skim cards."],
  [
    "Help when you're stuck",
    "Notes, a light self-check, and a module tutor.",
  ],
] as const;

export default function HomePage() {
  const packs = listPacks();
  const primaryPack = packs[0];

  return (
    <div id="top">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-6 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="animate-fade-up">
            <p className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary-soft-fg">
              Learn anything with a path that remembers you
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Your personal curriculum, forged for how you learn
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Pathforge builds a staged roadmap for whatever you want to learn,
              then walks you through it one module at a time — real lessons, a
              few quality resources, clear progress, and a tutor that stays on
              topic.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full px-6 text-white",
                )}
              >
                Start learning
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a
                href="#how"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "rounded-full px-6",
                )}
              >
                How it works
              </a>
            </div>
          </div>
          <div
            className="animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            <PathMock />
          </div>
        </div>
      </section>

      {/* Proof strip */}
      <section className="border-y border-border bg-muted-bg/40">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:grid-cols-3 sm:px-6">
          {PROOF.map(([title, body]) => (
            <div key={title}>
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 mx-auto max-w-6xl px-5 py-20 sm:px-6">
        <h2 className="max-w-lg font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          How it works
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          Four steps between &ldquo;I want to learn this&rdquo; and a study
          session you can start today.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <span className="font-display text-sm font-semibold text-primary">
                {s.n}
              </span>
              <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="scroll-mt-20 border-y border-border bg-muted-bg/40"
      >
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
          <h2 className="max-w-lg font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Structure and real teaching, in one place
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-fg">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product preview */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              See the whole path. Work on one module.
            </h2>
            <ul className="mt-7 space-y-4 text-sm sm:text-base">
              {[
                "Always know the next module — no planning your own week.",
                "Mark complete when you're ready; progress is honest, not gamified.",
                "The tutor is grounded in the lesson you're reading, so answers stay on topic.",
              ].map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-muted">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <PathMock />
        </div>
      </section>

      {/* Pack */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-6">
        <div
          className="flex flex-col items-start gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted">
              Start with a pack
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {primaryPack?.title ?? "AI Engineering"}
            </h3>
            <p className="mt-2 max-w-lg text-sm text-muted">
              A suggested starting point with sensible defaults: prompting,
              context, retrieval, evaluation, and shipping. Adjust it once
              you&apos;re inside.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Link
              href={
                primaryPack
                  ? `/paths/new?pack=${primaryPack.slug}`
                  : "/paths/new?pack=ai-engineering"
              }
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full px-6 text-white",
              )}
            >
              Start this pack
            </Link>
            <Link
              href="/paths/new"
              className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              Or start any custom topic
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 mx-auto max-w-3xl px-5 pb-20 sm:px-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Questions
        </h2>
        <dl className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl border border-border bg-card px-5 py-4"
            >
              <dt className="text-base font-medium tracking-tight">{f.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-muted-bg/40">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to forge your path?
          </h2>
          <p className="mt-3 text-muted">
            Tell Pathforge what you want to learn. Start your first module in
            minutes.
          </p>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-7 rounded-full px-7 text-white",
            )}
          >
            Start learning
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
