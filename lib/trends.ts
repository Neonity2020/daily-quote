export type TrendSource = "github" | "hacker-news";

export type TrendItem = {
  id: string;
  source: TrendSource;
  title: string;
  url: string;
  description: string;
  meta: string;
  score: number;
  comments?: number;
  language?: string;
  insight: string;
};

