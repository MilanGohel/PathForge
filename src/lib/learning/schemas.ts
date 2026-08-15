import { z } from "zod";

/** Models often emit ids as numbers; coerce to string for our app types. */
const idString = z.coerce.string().min(1);
const num = z.coerce.number();
const intNum = z.coerce.number().int();

export const l0Schema = z.object({
  title: z.string(),
  summary: z.string(),
  estHours: num,
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
        estHours: num,
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
        estMinutes: intNum.positive(),
      }),
    )
    .min(2)
    .max(10),
});

/** L2: one MDX lesson body + quiz + search queries (no card kinds). */
export const l2Schema = z.object({
  mdx: z
    .string()
    .min(400)
    .describe(
      "Full module lesson as MDX with required H2 skeleton sections (~10–15 min teachable read)",
    ),
  quiz: z
    .array(
      z.object({
        id: idString,
        prompt: z.string(),
        choices: z.array(z.string()).min(3).max(5),
        correctIndex: intNum.nonnegative(),
        explanation: z.string(),
      }),
    )
    .min(2)
    .max(5),
  resourceQueries: z
    .array(z.string())
    .min(1)
    .max(2)
    .describe("1–2 short web search queries for optional deeper resources"),
});

export const diagnosticQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        id: idString,
        prompt: z.string(),
        choices: z.array(z.string()).min(3).max(5),
        correctIndex: intNum.nonnegative(),
        skillTag: z.coerce
          .string()
          .describe("Short skill tag, e.g. ml-fundamentals, rag, or general"),
      }),
    )
    .min(5)
    .max(8),
});

export const todayBlurbSchema = z.object({
  blurb: z.string().max(280),
});
