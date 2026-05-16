import { NextResponse } from "next/server";
import type { TrendItem } from "@/lib/trends";

type HackerNewsItem = {
  id: number;
  by?: string;
  descendants?: number;
  score?: number;
  time?: number;
  title?: string;
  type?: string;
  url?: string;
};

export const dynamic = "force-dynamic";

export async function GET() {
  const idsResponse = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json",
    { next: { revalidate: 900 } }
  );

  if (!idsResponse.ok) {
    return NextResponse.json(
      { error: "Failed to load Hacker News story ids" },
      { status: idsResponse.status }
    );
  }

  const ids = (await idsResponse.json()) as number[];
  const stories = await Promise.all(
    ids.slice(0, 15).map(async (id) => {
      const storyResponse = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
        { next: { revalidate: 900 } }
      );

      if (!storyResponse.ok) {
        return null;
      }

      return (await storyResponse.json()) as HackerNewsItem | null;
    })
  );

  const items: TrendItem[] = stories
    .filter((story): story is HackerNewsItem => Boolean(story?.title))
    .map((story) => {
      const comments = story.descendants ?? 0;
      const score = story.score ?? 0;

      return {
        id: String(story.id),
        source: "hacker-news",
        title: story.title ?? "Untitled story",
        url: story.url ?? `https://news.ycombinator.com/item?id=${story.id}`,
        description: story.url
          ? new URL(story.url).hostname.replace(/^www\./, "")
          : "news.ycombinator.com",
        meta: `by ${story.by ?? "unknown"} · ${comments.toLocaleString()} comments`,
        score,
        comments,
        insight: buildHackerNewsInsight(story, score, comments)
      };
    });

  return NextResponse.json({
    source: "hacker-news",
    updatedAt: new Date().toISOString(),
    items
  });
}

function buildHackerNewsInsight(
  story: HackerNewsItem,
  score: number,
  comments: number
) {
  const discussion =
    comments > 100 ? "deep disagreement" : "focused technical curiosity";
  return `${story.title} is drawing ${discussion}; the useful question is what assumption it challenges.`;
}

