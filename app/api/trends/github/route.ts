import { NextResponse } from "next/server";
import type { TrendItem } from "@/lib/trends";

type GitHubRepo = {
  id: number;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string;
};

type GitHubSearchResponse = {
  items?: GitHubRepo[];
};

export const dynamic = "force-dynamic";

export async function GET() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const params = new URLSearchParams({
    q: `created:>=${since} stars:>20`,
    sort: "stars",
    order: "desc",
    per_page: "12"
  });

  const response = await fetch(
    `https://api.github.com/search/repositories?${params.toString()}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "daily-quote-app"
      },
      next: { revalidate: 1800 }
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to load GitHub trends" },
      { status: response.status }
    );
  }

  const data = (await response.json()) as GitHubSearchResponse;
  const items: TrendItem[] = (data.items ?? []).map((repo) => ({
    id: String(repo.id),
    source: "github",
    title: repo.full_name,
    url: repo.html_url,
    description: repo.description ?? "No repository description yet.",
    meta: `Created ${repo.created_at.slice(0, 10)} · ${repo.forks_count.toLocaleString()} forks`,
    score: repo.stargazers_count,
    language: repo.language ?? undefined,
    insight: buildGitHubInsight(repo)
  }));

  return NextResponse.json({
    source: "github",
    updatedAt: new Date().toISOString(),
    items
  });
}

function buildGitHubInsight(repo: GitHubRepo) {
  const language = repo.language ? `${repo.language} ` : "";
  return `${language}builders are paying attention to ${repo.full_name}; the signal is early adoption, not maturity.`;
}

