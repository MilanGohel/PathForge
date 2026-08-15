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
    "Personalized learning paths with on-demand AI generation, teachable MDX lessons, curated resources, and a module tutor.",
  openGraph: {
    title: "Pathforge — AI learning paths that teach",
    description:
      "Generate a path, learn module-by-module with real lessons, and go deeper with curated resources.",
  },
};

const PROOF = [
  {
    t: "Personalized paths",
    d: "Intake + diagnostic shape stages to your level and goal.",
  },
  {
    t: "Lessons that teach",
    d: "Full MDX modules with a clear outline — not thin skim cards.",
  },
  {
    t: "Real resources",
    d: "A few quality-ranked links to go deeper — optional.",
  },
];

const STEPS = [
  {
    n: "01",
    t: "Intake",
    d: "Say what you want to learn, your goal, and hours per week.",
  },
  {
    n: "02",
    t: "Diagnostic",
    d: "A short placement quiz — pack bank or generated for free-prompt topics.",
  },
  {
    n: "03",
    t: "Path stages",
    d: "Get a staged outline (L0). Open a stage when you’re ready for modules.",
  },
  {
    n: "04",
    t: "Module lessons",
    d: "Open a module for a teachable lesson, quiz, notes, and a grounded tutor.",
  },
];

const FEATURES = [
  {
    t: "Generate",
    d: "Lazy L0→L2 generation: outline first, modules on stage open, lessons on module open. Cached forever.",
  },
  {
    t: "Guide & teach",
    d: "Today’s next module, teachable MDX lessons with a clear outline, optional quiz, and a module-scoped tutor.",
  },
  {
    t: "Curate",
    d: "At most three ranked external links (≤1 video). The lesson stands alone without them.",
  },
];

const FAQ = [
  {
    q: "Is the whole course generated up front?",
    a: "No. Pathforge generates on demand: path outline after diagnostic, modules when you open a stage, lessons when you open a module. Everything is cached so you don’t pay twice.",
  },
  {
    q: "What’s the AI Engineering pack?",
    a: "A suggested entry point with sensible defaults and a fixed diagnostic bank. All course body is still AI-generated for you.",
  },
  {
    q: "How long does generation take?",
    a: "Depends on the model and load — often under a minute for a module lesson. Progress shows the real phase you’re in, not a looping fake checklist.",
  },
  {
    q: "Do I need the external links to learn?",
    a: "No. Each module lesson is written to teach the topic itself. Links are optional “go deeper” material.",
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
          { t: "LLM mental models", s: "3/4 modules", ready: true },
          { t: "Prompting & evaluation", s: "Generate on open", ready: false },
          { t: "RAG systems", s: "Not started", ready: false },
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
              Your personal curriculum, forged by AI
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Pathforge builds a staged roadmap for whatever you want to learn,
              then teaches module-by-module with full lessons, a few real
              resources, progress, and a grounded tutor — without generating an
              entire course up front.
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
              A clear loop from goal to next lesson — generate only what you
              need, when you need it.
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
              Marketing matches the product: generate, guide & teach, curate.
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
              Stages group modules. Lessons are teachable MDX reads with a
              topic-specific outline — sticky on desktop when you dive in.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                Lazy generation you can understand
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                Honor-system completion, no quiz gates
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                Module tutor grounded in the lesson
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
            Packs set defaults and placement only. Every lesson is still
            generated by Pathforge AI for you.
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
