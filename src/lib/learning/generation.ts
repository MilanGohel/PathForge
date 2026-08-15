import { generateObject, generateText } from "ai";
import { fastModel, getGateway, strongModel } from "@/lib/ai/models";
import { env } from "@/lib/env";
import { searchLearningResources } from "@/lib/search/serper";
import type {
  DiagnosticQuestion,
  DiagnosticResult,
  IntakeInput,
  L0Result,
  L1Result,
  L2Result,
} from "@/types/domain";
import {
  diagnosticQuestionsSchema,
  l0Schema,
  l1Schema,
  l2Schema,
  todayBlurbSchema,
} from "./schemas";

export class BudgetExceededError extends Error {
  constructor(message = "Daily generation budget exceeded") {
    super(message);
    this.name = "BudgetExceededError";
  }
}

export type ModelClient = {
  generateL0(input: {
    intake: IntakeInput;
    diagnostic: DiagnosticResult;
  }): Promise<L0Result>;
  generateL1(input: {
    pathTitle: string;
    topic: string;
    stageTitle: string;
    stageSummary: string;
    diagnostic: DiagnosticResult | null;
  }): Promise<L1Result>;
  generateL2Content(input: {
    topic: string;
    pathTitle: string;
    stageTitle: string;
    moduleTitle: string;
    moduleBlurb: string;
  }): Promise<{
    cards: L2Result["cards"];
    quiz: L2Result["quiz"];
    resourceQueries: string[];
  }>;
  generateDiagnosticQuestions(input: {
    topic: string;
    goal: string;
  }): Promise<DiagnosticQuestion[]>;
  generateTodayBlurb(input: {
    pathTitle: string;
    moduleTitle: string;
    moduleBlurb: string;
  }): Promise<string>;
};

export type SearchClient = {
  searchResources(input: {
    topic: string;
    moduleTitle: string;
    blurb?: string;
  }): Promise<L2Result["resources"]>;
};

export type BudgetStore = {
  countToday(userId: string): Promise<number>;
  record(event: {
    userId: string;
    level: string;
    entityId?: string;
    ok: boolean;
    errorMessage?: string;
    meta?: Record<string, unknown>;
  }): Promise<void>;
};

export type GatewayModelClientOptions = {
  /** Override for tests */
  gateway?: ReturnType<typeof getGateway>;
};

export function createGatewayModelClient(
  _opts?: GatewayModelClientOptions,
): ModelClient {
  return {
    async generateL0({ intake, diagnostic }) {
      const gateway = getGateway();
      const { object } = await generateObject({
        model: gateway(fastModel()),
        schema: l0Schema,
        prompt: `You are Pathforge, an expert curriculum designer.
Create a personalized learning PATH OUTLINE (stages only — no modules yet).

Topic: ${intake.topic}
Goal: ${intake.goal}
Hours per week: ${intake.hoursPerWeek}
Deadline: ${intake.deadline ?? "none"}

Learner placement:
- Level: ${diagnostic.levelLabel}
- Score: ${diagnostic.score}/${diagnostic.maxScore}
- Strengths: ${diagnostic.strengthTags.join(", ") || "n/a"}
- Gaps: ${diagnostic.gapTags.join(", ") || "n/a"}
- Summary: ${diagnostic.summary}

Rules:
- 4–10 stages, ordered from foundations to applied capstone-style practice.
- Respect placement: beginners get stronger foundations; advanced learners compress basics.
- estHours should be realistic for a motivated self-learner.
- domainAlert: ONLY a short practical warning if the topic truly cannot be learned well online alone (e.g. surgery, welding safety, instrument technique requiring in-person coaching). Otherwise null. Never warn for ordinary soft skills or normal online-learnable topics.
- Do not write full lessons. Stages only.`,
      });
      return object;
    },

    async generateL1({
      pathTitle,
      topic,
      stageTitle,
      stageSummary,
      diagnostic,
    }) {
      const gateway = getGateway();
      const { object } = await generateObject({
        model: gateway(fastModel()),
        schema: l1Schema,
        prompt: `You are Pathforge. Expand ONE stage into modules (titles + blurbs only).

Path: ${pathTitle}
Topic: ${topic}
Stage: ${stageTitle}
Stage summary: ${stageSummary}
Learner level: ${diagnostic?.levelLabel ?? "unknown"}
Gaps: ${diagnostic?.gapTags.join(", ") || "n/a"}

Rules:
- 3–8 modules for this stage only.
- Each module is one sitting (15–60 minutes typical).
- Concrete titles, not vague "Introduction" spam.
- No full lesson content yet.`,
      });
      return object;
    },

    async generateL2Content({
      topic,
      pathTitle,
      stageTitle,
      moduleTitle,
      moduleBlurb,
    }) {
      const gateway = getGateway();
      const { object } = await generateObject({
        model: gateway(strongModel()),
        schema: l2Schema,
        prompt: `You are Pathforge. Write a short card-based lesson for ONE module.

Path: ${pathTitle}
Topic: ${topic}
Stage: ${stageTitle}
Module: ${moduleTitle}
Blurb: ${moduleBlurb}

Produce:
1) 5 cards with kinds: concept, why_it_matters, example, pitfall, try_this (use those kinds).
2) 2–4 multiple-choice quiz items with explanations (optional practice — not a gate).
3) 1–3 short web search queries to find excellent free learning resources (docs, tutorials, reputable articles, videos).

Keep card bodies tight (short paragraphs). Be accurate and practical.`,
      });
      return object;
    },

    async generateDiagnosticQuestions({ topic, goal }) {
      const gateway = getGateway();
      const { object } = await generateObject({
        model: gateway(fastModel()),
        schema: diagnosticQuestionsSchema,
        prompt: `Create a short placement diagnostic (5–8 multiple choice questions) for someone who wants to learn:

Topic: ${topic}
Goal: ${goal}

Questions should probe prior knowledge to place them beginner/intermediate/advanced.
Include correctIndex for the best answer. Tag skills with skillTag when useful.`,
      });
      return object.questions;
    },

    async generateTodayBlurb({ pathTitle, moduleTitle, moduleBlurb }) {
      const gateway = getGateway();
      const { object } = await generateObject({
        model: gateway(fastModel()),
        schema: todayBlurbSchema,
        prompt: `Write one short encouraging line (max 220 chars) for today's learning focus.
Path: ${pathTitle}
Module: ${moduleTitle}
About: ${moduleBlurb}
No hashtags. No markdown.`,
      });
      return object.blurb;
    },
  };
}

export function createSerperSearchClient(): SearchClient {
  return {
    searchResources: searchLearningResources,
  };
}

export type LearningGenerationDeps = {
  models: ModelClient;
  search: SearchClient;
  budget: BudgetStore;
  dailyBudget?: number;
};

/**
 * Primary application seam: all token spend + search for learning content.
 * Cache decisions live in the repository/actions layer; this service generates.
 */
export class LearningGeneration {
  private models: ModelClient;
  private search: SearchClient;
  private budget: BudgetStore;
  private dailyBudget: number;

  constructor(deps: LearningGenerationDeps) {
    this.models = deps.models;
    this.search = deps.search;
    this.budget = deps.budget;
    this.dailyBudget = deps.dailyBudget ?? env.generationDailyBudget();
  }

  private async assertBudget(userId: string) {
    const used = await this.budget.countToday(userId);
    if (used >= this.dailyBudget) {
      throw new BudgetExceededError(
        `Daily generation budget reached (${used}/${this.dailyBudget}). Try again tomorrow or raise GENERATION_DAILY_BUDGET.`,
      );
    }
  }

  private async track(
    userId: string,
    level: string,
    entityId: string | undefined,
    fn: () => Promise<void>,
  ) {
    await this.assertBudget(userId);
    try {
      await fn();
      await this.budget.record({ userId, level, entityId, ok: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error";
      await this.budget.record({
        userId,
        level,
        entityId,
        ok: false,
        errorMessage: message,
      });
      throw e;
    }
  }

  async createL0(
    userId: string,
    input: { intake: IntakeInput; diagnostic: DiagnosticResult },
  ): Promise<L0Result> {
    let result!: L0Result;
    await this.track(userId, "L0", undefined, async () => {
      result = await this.models.generateL0(input);
    });
    return result;
  }

  async createL1(
    userId: string,
    stageId: string,
    input: Parameters<ModelClient["generateL1"]>[0],
  ): Promise<L1Result> {
    let result!: L1Result;
    await this.track(userId, "L1", stageId, async () => {
      result = await this.models.generateL1(input);
    });
    return result;
  }

  async createL2(
    userId: string,
    moduleId: string,
    input: {
      topic: string;
      pathTitle: string;
      stageTitle: string;
      moduleTitle: string;
      moduleBlurb: string;
    },
  ): Promise<L2Result> {
    let result!: L2Result;
    await this.track(userId, "L2", moduleId, async () => {
      const content = await this.models.generateL2Content(input);
      // Prefer model queries; fall back to module title search
      let resources: L2Result["resources"] = [];
      try {
        const q =
          content.resourceQueries[0] ??
          `${input.moduleTitle} ${input.topic} tutorial`;
        resources = await this.search.searchResources({
          topic: q,
          moduleTitle: input.moduleTitle,
          blurb: input.moduleBlurb,
        });
        if (content.resourceQueries.length > 1) {
          const extra = await this.search.searchResources({
            topic: content.resourceQueries[1],
            moduleTitle: input.moduleTitle,
          });
          const seen = new Set(resources.map((r) => r.url));
          for (const r of extra) {
            if (!seen.has(r.url)) {
              seen.add(r.url);
              resources.push(r);
            }
          }
        }
      } catch {
        resources = [];
      }
      result = {
        cards: content.cards,
        quiz: content.quiz,
        resources: resources.slice(0, 8),
      };
    });
    return result;
  }

  async createDiagnosticQuestions(
    userId: string,
    input: { topic: string; goal: string },
  ): Promise<DiagnosticQuestion[]> {
    let result!: DiagnosticQuestion[];
    await this.track(userId, "diagnostic", undefined, async () => {
      result = await this.models.generateDiagnosticQuestions(input);
    });
    return result;
  }

  async createTodayBlurb(
    userId: string,
    input: {
      pathTitle: string;
      moduleTitle: string;
      moduleBlurb: string;
    },
  ): Promise<string> {
    let result = `Today: ${input.moduleTitle}`;
    try {
      await this.track(userId, "L4", undefined, async () => {
        result = await this.models.generateTodayBlurb(input);
      });
    } catch {
      // blurb is optional — fall back silently
    }
    return result;
  }
}

/** Tutor system prompt builder (used by chat route with streamText) */
export function buildTutorSystemPrompt(input: {
  pathTitle: string;
  stageTitle: string;
  moduleTitle: string;
  cardsJson: string;
  challengeMode?: boolean;
}) {
  const challenge = input.challengeMode
    ? `Mode: CHALLENGE ME. Ask exactly one practice question at a time, wait for the learner answer, then briefly grade and continue with the next question only when they ask or answer.`
    : `Mode: normal tutor. Answer questions, explain simply, use Socratic hints when stuck.`;

  return `You are Pathforge's module tutor. Stay strictly on this module's content unless the learner needs a tiny prerequisite clarification.

Path: ${input.pathTitle}
Stage: ${input.stageTitle}
Module: ${input.moduleTitle}

Lesson cards (JSON):
${input.cardsJson}

${challenge}

Rules:
- Ground answers in the lesson cards.
- Keep replies concise.
- If asked something far off-curriculum, briefly redirect to the module.`;
}

export async function generateTutorSeedChallenge(input: {
  moduleTitle: string;
  cardsJson: string;
}): Promise<string> {
  const gateway = getGateway();
  const { text } = await generateText({
    model: gateway(fastModel()),
    prompt: `Given this lesson, write ONE short challenge question for the learner (no answer).
Module: ${input.moduleTitle}
Cards: ${input.cardsJson}`,
  });
  return text.trim();
}
