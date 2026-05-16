export type TrendSource = "github" | "hacker-news";

export type TrendItem = {
  id: string;
  source: TrendSource;
  title: string;
  summaryZh: string;
  topicZh: string;
  reasonZh: string;
  url: string;
  description: string;
  meta: string;
  score: number;
  comments?: number;
  language?: string;
  insight: string;
  tags: string[];
};

export function getTrendTags(text: string, language?: string | null) {
  const normalized = text.toLowerCase();
  const tags: string[] = [];

  const rules: Array<[string, string[]]> = [
    ["AI", ["ai", "llm", "agent", "model", "openai", "claude", "inference"]],
    ["开发工具", ["cli", "developer", "debug", "terminal", "ide", "sdk", "api"]],
    ["安全", ["security", "vulnerability", "bypass", "auth", "encrypt", "malware"]],
    ["基础设施", ["database", "server", "cloud", "kubernetes", "docker", "runtime"]],
    ["开源项目", ["open source", "github", "repository", "library", "framework"]],
    ["产品", ["product", "startup", "saas", "pricing", "customer"]],
    ["研究", ["paper", "research", "benchmark", "study", "science"]],
    ["效率", ["automation", "workflow", "productivity", "tool"]]
  ];

  for (const [tag, keywords] of rules) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      tags.push(tag);
    }
  }

  if (language) {
    tags.push(language);
  }

  return [...new Set(tags)].slice(0, 4);
}

export function summarizeTitleZh(title: string) {
  const cleaned = title.replace(/\s+/g, " ").trim();
  const lower = cleaned.toLowerCase();

  if (lower.includes("ai") || lower.includes("llm") || lower.includes("agent")) {
    return `AI 相关：${cleaned}`;
  }

  if (lower.includes("security") || lower.includes("vulnerability")) {
    return `安全风险：${cleaned}`;
  }

  if (lower.includes("open source") || lower.includes("github")) {
    return `开源动态：${cleaned}`;
  }

  if (lower.includes("show hn")) {
    return `新产品展示：${cleaned.replace(/^show hn:\s*/i, "")}`;
  }

  if (lower.includes("ask hn")) {
    return `社区问题：${cleaned.replace(/^ask hn:\s*/i, "")}`;
  }

  return cleaned.length > 64 ? `${cleaned.slice(0, 64)}...` : cleaned;
}
