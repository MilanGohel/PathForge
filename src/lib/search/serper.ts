import { env } from "@/lib/env";
import type { ResourceDraft, ResourceKind } from "@/types/domain";

export type SerperOrganic = {
  title: string;
  link: string;
  snippet?: string;
  position?: number;
};

export type SerperResponse = {
  organic?: SerperOrganic[];
};

function guessKind(url: string, title: string): ResourceKind {
  const u = url.toLowerCase();
  const t = title.toLowerCase();
  if (
    u.includes("youtube.com") ||
    u.includes("youtu.be") ||
    t.includes("video")
  ) {
    return "video";
  }
  if (
    u.includes("amazon.") ||
    t.includes("book") ||
    u.includes("oreilly.com") ||
    u.includes("manning.com")
  ) {
    return "book";
  }
  return "article";
}

function providerFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "web";
  }
}

export async function searchWeb(
  query: string,
  opts?: { num?: number },
): Promise<ResourceDraft[]> {
  const key = env.serperApiKey();
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: query,
      num: opts?.num ?? 8,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Serper search failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as SerperResponse;
  const organic = data.organic ?? [];

  return organic
    .filter((o) => o.link && o.title)
    .map((o) => ({
      title: o.title,
      url: o.link,
      kind: guessKind(o.link, o.title),
      provider: providerFromUrl(o.link),
      snippet: o.snippet,
    }));
}

export async function searchLearningResources(input: {
  topic: string;
  moduleTitle: string;
  blurb?: string;
}): Promise<ResourceDraft[]> {
  const q = `${input.moduleTitle} ${input.topic} tutorial OR guide OR course -job -salary`;
  const web = await searchWeb(q, { num: 8 });

  // Optional YouTube pass when key present
  const ytKey = env.youtubeApiKey();
  let videos: ResourceDraft[] = [];
  if (ytKey) {
    try {
      videos = await searchYouTube(`${input.moduleTitle} ${input.topic}`, ytKey);
    } catch {
      videos = [];
    }
  }

  const merged = [...videos.slice(0, 3), ...web];
  const seen = new Set<string>();
  const unique: ResourceDraft[] = [];
  for (const r of merged) {
    if (seen.has(r.url)) continue;
    seen.add(r.url);
    unique.push(r);
  }
  return unique.slice(0, 8);
}

async function searchYouTube(
  query: string,
  apiKey: string,
): Promise<ResourceDraft[]> {
  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: "5",
    q: query,
    key: apiKey,
  });
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(`YouTube API failed (${res.status})`);
  }
  const data = (await res.json()) as {
    items?: Array<{
      id?: { videoId?: string };
      snippet?: { title?: string; description?: string; channelTitle?: string };
    }>;
  };

  return (data.items ?? [])
    .filter((i) => i.id?.videoId && i.snippet?.title)
    .map((i) => ({
      title: i.snippet!.title!,
      url: `https://www.youtube.com/watch?v=${i.id!.videoId}`,
      kind: "video" as const,
      provider: "youtube.com",
      snippet: i.snippet?.description?.slice(0, 180),
    }));
}
