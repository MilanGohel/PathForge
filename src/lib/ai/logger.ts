import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const LOG_DIR = path.join(process.cwd(), ".scratch", "ai-logs");

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

/**
 * Persist AI raw/parsed payloads for local debugging.
 * Writes under .scratch/ai-logs/ (gitignored via .scratch if needed).
 * Always mirrors a short summary to the server console.
 */
export async function logAiEvent(event: {
  schemaName: string;
  phase: string;
  ok: boolean;
  modelHint?: string;
  rawText?: string;
  parsed?: unknown;
  error?: string;
  meta?: Record<string, unknown>;
}) {
  const line = {
    at: new Date().toISOString(),
    ...event,
  };

  const summary = `[ai] ${event.schemaName} · ${event.phase} · ${event.ok ? "ok" : "FAIL"}${
    event.error ? ` · ${event.error.slice(0, 160)}` : ""
  }`;
  console.log(summary);
  if (event.rawText && !event.ok) {
    console.log(
      `[ai] raw (${event.schemaName}, ${event.rawText.length} chars):\n${event.rawText.slice(0, 2000)}`,
    );
  }

  try {
    await mkdir(LOG_DIR, { recursive: true });
    const file = path.join(
      LOG_DIR,
      `${stamp()}_${event.schemaName}_${event.phase}.json`,
    );
    await appendFile(file, `${JSON.stringify(line, null, 2)}\n`, "utf8");

    // Rolling combined log for easy tailing
    await appendFile(
      path.join(LOG_DIR, "latest.jsonl"),
      `${JSON.stringify(line)}\n`,
      "utf8",
    );
  } catch (e) {
    console.warn("[ai] failed to write log file", e);
  }
}
