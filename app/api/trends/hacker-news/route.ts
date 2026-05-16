import { NextResponse } from "next/server";
import {
  getTrendTags,
  summarizeTitleZh,
  type TrendItem
} from "@/lib/trends";

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
        summaryZh: summarizeTitleZh(story.title ?? "Untitled story"),
        topicZh: inferHackerNewsTopic(story),
        reasonZh: buildHackerNewsReason(score, comments),
        url: story.url ?? `https://news.ycombinator.com/item?id=${story.id}`,
        description: story.url
          ? new URL(story.url).hostname.replace(/^www\./, "")
          : "news.ycombinator.com",
        meta: `by ${story.by ?? "unknown"} · ${comments.toLocaleString()} comments`,
        score,
        comments,
        insight: buildHackerNewsInsight(story, score, comments),
        tags: getTrendTags(`${story.title ?? ""} ${story.url ?? ""}`)
      };
    });

  return NextResponse.json({
    source: "hacker-news",
    updatedAt: new Date().toISOString(),
    items
  });
}

function inferHackerNewsTopic(story: HackerNewsItem) {
  const text = `${story.title ?? ""} ${story.url ?? ""}`.toLowerCase();

  if (text.includes("ai") || text.includes("llm") || text.includes("agent")) {
    return "AI / 未来工作";
  }

  if (text.includes("security") || text.includes("vulnerability") || text.includes("privacy")) {
    return "安全 / 隐私";
  }

  if (text.includes("show hn")) {
    return "新产品 / 独立开发";
  }

  if (text.includes("ask hn")) {
    return "社区讨论";
  }

  if (text.includes("database") || text.includes("postgres") || text.includes("sqlite")) {
    return "数据 / 基础设施";
  }

  return "技术社区热点";
}

function buildHackerNewsReason(score: number, comments: number) {
  if (comments > 200) {
    return `${score.toLocaleString()} points、${comments.toLocaleString()} 条评论，讨论密度很高，适合判断社区分歧。`;
  }

  if (score > 500) {
    return `${score.toLocaleString()} points，关注度已经明显超过普通热门帖。`;
  }

  return `${score.toLocaleString()} points、${comments.toLocaleString()} 条评论，可作为今天的技术雷达信号。`;
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
