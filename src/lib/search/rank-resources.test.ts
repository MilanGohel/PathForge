import { describe, expect, it } from "vitest";
import { rankAndCapResources } from "./rank-resources";

describe("rankAndCapResources", () => {
  it("caps at 3 and allows at most one video", () => {
    const out = rankAndCapResources(
      [
        {
          title: "YT1",
          url: "https://youtube.com/1",
          kind: "video",
          provider: "youtube.com",
        },
        {
          title: "YT2",
          url: "https://youtube.com/2",
          kind: "video",
          provider: "youtube.com",
        },
        {
          title: "Docs",
          url: "https://docs.example.com/x",
          kind: "article",
          provider: "docs.example.com",
        },
        {
          title: "Guide",
          url: "https://example.com/guide",
          kind: "article",
          provider: "example.com",
        },
        {
          title: "Blog",
          url: "https://blog.example.com/a",
          kind: "article",
          provider: "blog.example.com",
        },
        {
          title: "More",
          url: "https://other.com/a",
          kind: "article",
          provider: "other.com",
        },
      ],
      { max: 3, maxVideos: 1 },
    );

    expect(out).toHaveLength(3);
    expect(out.filter((r) => r.kind === "video")).toHaveLength(1);
    expect(out[0]?.provider).toContain("docs");
  });
});
