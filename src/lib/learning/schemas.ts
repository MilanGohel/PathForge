import { z } from "zod";

export const l0Schema = z.object({
  title: z.string(),
  summary: z.string(),
  estHours: z.number(),
  domainAlert: z
    .string()
    .nullable()
    .describe(
      "Only set when the topic truly needs hands-on/physical/clinical practice offline; otherwise null",
    ),
  stages: z
    .array(
      z.object({
        title: z.string(),
        summary: z.string(),
        estHours: z.number(),
      }),
    )
    .min(3)
    .max(12),
});

export const l1Schema = z.object({
  modules: z
    .array(
      z.object({
        title: z.string(),
        blurb: z.string(),
        estMinutes: z.number().int().positive(),
      }),
    )
    .min(2)
    .max(10),
});

export const l2Schema = z.object({
  cards: z
    .array(
      z.object({
        id: z.string(),
        kind: z.enum([
          "concept",
          "why_it_matters",
          "example",
          "pitfall",
          "try_this",
        ]),
        title: z.string(),
        body: z.string(),
      }),
    )
    .min(4)
    .max(6),
  quiz: z
    .array(
      z.object({
        id: z.string(),
        prompt: z.string(),
        choices: z.array(z.string()).min(3).max(5),
        correctIndex: z.number().int().nonnegative(),
        explanation: z.string(),
      }),
    )
    .min(2)
    .max(5),
  resourceQueries: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe("Short web search queries to find high-quality learning resources"),
});

export const diagnosticQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        id: z.string(),
        prompt: z.string(),
        choices: z.array(z.string()).min(3).max(5),
        correctIndex: z.number().int().nonnegative(),
        skillTag: z.string().optional(),
      }),
    )
    .min(5)
    .max(8),
});

export const todayBlurbSchema = z.object({
  blurb: z.string().max(280),
});
