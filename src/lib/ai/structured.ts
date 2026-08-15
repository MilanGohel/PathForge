import {
  generateObject,
  generateText,
  NoObjectGeneratedError,
  type LanguageModel,
} from "ai";
import type { z } from "zod";
import { logAiEvent } from "./logger";

/**
 * Many Gateway models (Xiaomi, DeepSeek, etc.) wrap JSON in markdown fences,
 * add prose, or ignore strict response_format. We:
 * 1) try generateObject + repairText
 * 2) fall back to generateText and parse JSON ourselves
 */

export function extractJsonCandidate(text: string): string {
  let s = text.trim();

  const fenced = s.match(/```(?:json|JSON)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) {
    s = fenced[1].trim();
  }

  const objStart = s.indexOf("{");
  const arrStart = s.indexOf("[");
  let start = -1;
  if (objStart >= 0 && arrStart >= 0) start = Math.min(objStart, arrStart);
  else start = Math.max(objStart, arrStart);

  if (start < 0) return s;

  const open = s[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }

  return s.slice(start);
}

async function repairText({
  text,
}: {
  text: string;
  error: unknown;
}): Promise<string | null> {
  try {
    const candidate = extractJsonCandidate(text);
    JSON.parse(candidate);
    return candidate;
  } catch {
    return null;
  }
}

export async function generateStructured<TSchema extends z.ZodType>(input: {
  model: LanguageModel;
  schema: TSchema;
  prompt: string;
  schemaName: string;
}): Promise<z.infer<TSchema>> {
  const { model, schema, prompt, schemaName } = input;

  await logAiEvent({
    schemaName,
    phase: "start",
    ok: true,
    meta: { promptChars: prompt.length },
  });

  try {
    const { object } = await generateObject({
      model,
      schema,
      schemaName,
      prompt,
      maxRetries: 2,
      repairText,
    });
    await logAiEvent({
      schemaName,
      phase: "generateObject",
      ok: true,
      parsed: object,
    });
    return object as z.infer<TSchema>;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logAiEvent({
      schemaName,
      phase: "generateObject",
      ok: false,
      error: message,
    });

    const isNoObject =
      NoObjectGeneratedError.isInstance(err) ||
      (err instanceof Error &&
        /could not parse the response|No object generated|failed validation|Invalid schema/i.test(
          err.message,
        ));

    // Also fall back on Zod validation failures from generateObject when the
    // model returned JSON with wrong types (e.g. numeric ids).
    const shouldFallback =
      isNoObject ||
      (err instanceof Error && /validation|invalid_type|expected/i.test(err.message));

    if (!shouldFallback) throw err;

    const { text } = await generateText({
      model,
      maxRetries: 2,
      prompt: `${prompt}

CRITICAL OUTPUT RULES:
- Respond with a single JSON object only (no markdown fences, no commentary).
- Match this shape name: ${schemaName}
- Use double quotes for all keys and string values.
- id fields may be strings OR numbers (we coerce).
- Numbers must be JSON numbers where the schema expects numbers.
- null is allowed only where the schema permits null.`,
    });

    await logAiEvent({
      schemaName,
      phase: "generateText_fallback_raw",
      ok: true,
      rawText: text,
    });

    const candidate = extractJsonCandidate(text);
    let parsed: unknown;
    try {
      parsed = JSON.parse(candidate);
    } catch {
      await logAiEvent({
        schemaName,
        phase: "parse",
        ok: false,
        rawText: text,
        error: "JSON.parse failed",
      });
      throw new Error(
        `Model returned non-JSON for ${schemaName}. First 280 chars: ${text.slice(0, 280)}`,
      );
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      await logAiEvent({
        schemaName,
        phase: "zod",
        ok: false,
        rawText: text,
        parsed,
        error: result.error.message,
      });
      throw new Error(
        `JSON for ${schemaName} failed validation: ${result.error.message}`,
      );
    }

    await logAiEvent({
      schemaName,
      phase: "generateText_fallback",
      ok: true,
      parsed: result.data,
    });
    return result.data;
  }
}
