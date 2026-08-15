import type { ResourceDraft } from "@/types/domain";

const DOCS_HOST_HINTS = [
  "developer.mozilla.org",
  "docs.",
  "documentation",
  "readthedocs",
  "github.com",
  "wikipedia.org",
  "learn.microsoft.com",
  "cloud.google.com",
  "aws.amazon.com",
  "kubernetes.io",
  "react.dev",
  "nextjs.org",
  "python.org",
  "nodejs.org",
  "openai.com",
  "anthropic.com",
  "supabase.com",
  "vercel.com",
];

function score(r: ResourceDraft): number {
  let s = 0;
  const host = (r.provider ?? "").toLowerCase();
  const title = r.title.toLowerCase();
  if (r.kind === "article") s += 3;
  if (r.kind === "book") s += 2;
  if (r.kind === "video") s += 1;
  if (DOCS_HOST_HINTS.some((h) => host.includes(h) || r.url.includes(h))) {
    s += 5;
  }
  if (
    title.includes("docs") ||
    title.includes("documentation") ||
    title.includes("guide")
  ) {
    s += 2;
  }
  if (host.includes("youtube") || host.includes("youtu.be")) s -= 1;
  if (
    title.includes("job") ||
    title.includes("salary") ||
    title.includes("hiring")
  ) {
    s -= 5;
  }
  return s;
}

/**
 * Cap resources at 3; prefer docs/articles; include at most 1 video when present.
 */
export function rankAndCapResources(
  items: ResourceDraft[],
  opts?: { max?: number; maxVideos?: number },
): ResourceDraft[] {
  const max = opts?.max ?? 3;
  const maxVideos = opts?.maxVideos ?? 1;

  const seen = new Set<string>();
  const unique = items.filter((r) => {
    if (!r.url || seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  const sorted = [...unique].sort((a, b) => score(b) - score(a));
  const nonVideos = sorted.filter((r) => r.kind !== "video");
  const videos = sorted.filter((r) => r.kind === "video");

  const out: ResourceDraft[] = [];

  // Prefer reading material first, leave room for one video when available
  const articleSlots =
    maxVideos > 0 && videos.length > 0 ? Math.max(1, max - maxVideos) : max;

  for (const r of nonVideos) {
    if (out.length >= articleSlots) break;
    out.push(r);
  }

  for (const r of videos) {
    if (out.length >= max) break;
    if (out.filter((x) => x.kind === "video").length >= maxVideos) break;
    out.push(r);
  }

  // Fill remaining with more non-videos
  for (const r of nonVideos) {
    if (out.length >= max) break;
    if (out.some((x) => x.url === r.url)) continue;
    out.push(r);
  }

  return out.slice(0, max);
}
