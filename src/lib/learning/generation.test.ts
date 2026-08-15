import { describe, expect, it, vi } from "vitest";
import {
  BudgetExceededError,
  LearningGeneration,
  type ModelClient,
  type SearchClient,
} from "./generation";
import { createMemoryBudgetStore } from "./budget-store";
import { pickTodayModule } from "./today";
import { scoreDiagnostic } from "./diagnostic";
import type { DiagnosticResult, IntakeInput } from "@/types/domain";

const intake: IntakeInput = {
  topic: "AI Engineering",
  goal: "Build agents",
  hoursPerWeek: 6,
};

const diagnostic: DiagnosticResult = {
  score: 6,
  maxScore: 10,
  levelLabel: "intermediate",
  summary: "ok",
  strengthTags: ["rag"],
  gapTags: ["agents"],
};

function mockModels(overrides?: Partial<ModelClient>): ModelClient {
  return {
    generateL0: vi.fn(async () => ({
      title: "AI Engineering Path",
      summary: "A path",
      estHours: 40,
      domainAlert: null,
      stages: [
        { title: "Foundations", summary: "Basics", estHours: 8 },
        { title: "Build", summary: "Projects", estHours: 12 },
      ],
    })),
    generateL1: vi.fn(async () => ({
      modules: [
        { title: "What is ML", blurb: "Intro", estMinutes: 25 },
        { title: "Loss curves", blurb: "Metrics", estMinutes: 30 },
      ],
    })),
    generateL2Content: vi.fn(async () => ({
      cards: [
        {
          id: "c1",
          kind: "concept" as const,
          title: "Concept",
          body: "Body",
        },
        {
          id: "c2",
          kind: "why_it_matters" as const,
          title: "Why",
          body: "Body",
        },
        {
          id: "c3",
          kind: "example" as const,
          title: "Example",
          body: "Body",
        },
        {
          id: "c4",
          kind: "pitfall" as const,
          title: "Pitfall",
          body: "Body",
        },
        {
          id: "c5",
          kind: "try_this" as const,
          title: "Try",
          body: "Body",
        },
      ],
      quiz: [
        {
          id: "q1",
          prompt: "Q?",
          choices: ["a", "b", "c"],
          correctIndex: 0,
          explanation: "because",
        },
      ],
      resourceQueries: ["machine learning tutorial"],
    })),
    generateDiagnosticQuestions: vi.fn(async () => [
      {
        id: "d1",
        prompt: "P",
        choices: ["a", "b"],
        correctIndex: 0,
      },
    ]),
    generateTodayBlurb: vi.fn(async () => "Ship one module today."),
    ...overrides,
  };
}

function mockSearch(): SearchClient {
  return {
    searchResources: vi.fn(async () => [
      {
        title: "Good Guide",
        url: "https://example.com/guide",
        kind: "article" as const,
        provider: "example.com",
      },
    ]),
  };
}

describe("LearningGeneration", () => {
  it("creates L0 via models and records budget", async () => {
    const budget = createMemoryBudgetStore();
    const models = mockModels();
    const gen = new LearningGeneration({
      models,
      search: mockSearch(),
      budget,
      dailyBudget: 10,
    });

    const result = await gen.createL0("user-1", { intake, diagnostic });
    expect(result.stages).toHaveLength(2);
    expect(models.generateL0).toHaveBeenCalledOnce();
    expect(await budget.countToday("user-1")).toBe(1);
  });

  it("creates L2 with search resources", async () => {
    const budget = createMemoryBudgetStore();
    const search = mockSearch();
    const gen = new LearningGeneration({
      models: mockModels(),
      search,
      budget,
      dailyBudget: 10,
    });

    const result = await gen.createL2("user-1", "mod-1", {
      topic: "AI",
      pathTitle: "Path",
      stageTitle: "S",
      moduleTitle: "M",
      moduleBlurb: "B",
    });

    expect(result.cards.length).toBeGreaterThanOrEqual(4);
    expect(result.resources[0]?.url).toContain("example.com");
    expect(search.searchResources).toHaveBeenCalled();
  });

  it("throws when daily budget exceeded", async () => {
    const budget = createMemoryBudgetStore();
    const gen = new LearningGeneration({
      models: mockModels(),
      search: mockSearch(),
      budget,
      dailyBudget: 1,
    });

    await gen.createL0("user-1", { intake, diagnostic });
    await expect(gen.createL0("user-1", { intake, diagnostic })).rejects.toBeInstanceOf(
      BudgetExceededError,
    );
  });

  it("does not consume budget count on failed generation before record ok", async () => {
    const budget = createMemoryBudgetStore();
    const models = mockModels({
      generateL0: vi.fn(async () => {
        throw new Error("gateway down");
      }),
    });
    const gen = new LearningGeneration({
      models,
      search: mockSearch(),
      budget,
      dailyBudget: 5,
    });

    await expect(
      gen.createL0("user-1", { intake, diagnostic }),
    ).rejects.toThrow("gateway down");
    // failed events recorded but countToday only counts ok:true
    expect(await budget.countToday("user-1")).toBe(0);
    expect(budget.events.some((e) => !e.ok)).toBe(true);
  });
});

describe("pickTodayModule", () => {
  it("picks first incomplete in stage/module order", () => {
    const today = pickTodayModule([
      {
        id: "m2",
        title: "Second",
        blurb: "",
        est_minutes: 20,
        completed_at: null,
        position: 1,
        stage: { id: "s1", title: "A", position: 0, path_id: "p" },
      },
      {
        id: "m1",
        title: "First",
        blurb: "",
        est_minutes: 20,
        completed_at: "2026-01-01",
        position: 0,
        stage: { id: "s1", title: "A", position: 0, path_id: "p" },
      },
      {
        id: "m3",
        title: "Other stage",
        blurb: "",
        est_minutes: 20,
        completed_at: null,
        position: 0,
        stage: { id: "s0", title: "B", position: -1, path_id: "p" },
      },
    ]);
    expect(today?.id).toBe("m3");
  });
});

describe("scoreDiagnostic", () => {
  it("labels beginner/intermediate/advanced from ratio", () => {
    const questions = [
      {
        id: "1",
        prompt: "p",
        choices: ["a", "b"],
        correctIndex: 0,
        skillTag: "x",
      },
      {
        id: "2",
        prompt: "p",
        choices: ["a", "b"],
        correctIndex: 1,
        skillTag: "y",
      },
    ];
    const advanced = scoreDiagnostic(questions, [
      { questionId: "1", choiceIndex: 0 },
      { questionId: "2", choiceIndex: 1 },
    ]);
    expect(advanced.levelLabel).toBe("advanced");
    expect(advanced.strengthTags).toContain("x");
  });
});
