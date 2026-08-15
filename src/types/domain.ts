export type PathSource = "pack" | "prompt";
export type GenerationStatus = "pending" | "generating" | "ready" | "error";
export type ResourceKind = "article" | "video" | "book" | "other";

export type IntakeInput = {
  topic: string;
  goal: string;
  hoursPerWeek: number;
  deadline?: string | null;
  packSlug?: string | null;
};

export type DiagnosticQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  /** Index of the best/advanced answer; used for simple scoring */
  correctIndex: number;
  skillTag?: string;
};

export type DiagnosticAnswer = {
  questionId: string;
  choiceIndex: number;
};

export type DiagnosticResult = {
  score: number;
  maxScore: number;
  levelLabel: "beginner" | "intermediate" | "advanced";
  summary: string;
  strengthTags: string[];
  gapTags: string[];
};

export type LessonCard = {
  id: string;
  kind: "concept" | "why_it_matters" | "example" | "pitfall" | "try_this";
  title: string;
  body: string;
};

export type QuizItem = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

export type ResourceDraft = {
  title: string;
  url: string;
  kind: ResourceKind;
  provider?: string;
  snippet?: string;
};

export type L0Stage = {
  title: string;
  summary: string;
  estHours: number;
};

export type L0Result = {
  title: string;
  summary: string;
  estHours: number;
  stages: L0Stage[];
  domainAlert: string | null;
};

export type L1Module = {
  title: string;
  blurb: string;
  estMinutes: number;
};

export type L1Result = {
  modules: L1Module[];
};

export type L2Result = {
  cards: LessonCard[];
  quiz: QuizItem[];
  resources: ResourceDraft[];
};

export type PackTemplate = {
  slug: string;
  title: string;
  description: string;
  intakeDefaults: {
    topic: string;
    goal: string;
    hoursPerWeek: number;
  };
  diagnosticBank: DiagnosticQuestion[];
};
