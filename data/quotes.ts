export type QuoteCategory =
  | "business-growth"
  | "ai-philosophy"
  | "stoicism"
  | "startup"
  | "product"
  | "engineering-culture"
  | "github-trending"
  | "hacker-news";

export type Quote = {
  id: string;
  quoteZh: string;
  quoteEn: string;
  author: string;
  source?: string;
  sourceUrl?: string;
  date: string;
  interpretation: string;
  category: QuoteCategory;
  tags: string[];
};

export const categoryLabels: Record<QuoteCategory, string> = {
  "business-growth": "商业成长",
  "ai-philosophy": "AI 哲学",
  stoicism: "斯多葛",
  startup: "创业",
  product: "产品",
  "engineering-culture": "工程文化",
  "github-trending": "GitHub Trending",
  "hacker-news": "Hacker News"
};

export const quotes: Quote[] = [
  {
    id: "2026-05-16",
    date: "2026-05-16",
    quoteEn: "The obstacle is the way.",
    quoteZh: "阻碍本身，就是道路。",
    author: "Ryan Holiday",
    source: "The Obstacle Is the Way",
    interpretation:
      "今天适合把摩擦当作信号：真正值得做的事，往往不会以顺滑的方式出现。",
    category: "stoicism",
    tags: ["斯多葛", "行动", "长期主义"]
  },
  {
    id: "2026-05-17",
    date: "2026-05-17",
    quoteEn: "What gets measured gets managed, but what gets loved gets improved.",
    quoteZh: "被衡量的事会被管理，被热爱的事才会被持续改进。",
    author: "Daily Quotes Editorial",
    source: "Business Growth Notes",
    interpretation:
      "指标能帮你看清方向，但真正拉开差距的，是你是否愿意反复打磨那个细节。",
    category: "business-growth",
    tags: ["商业成长", "执行", "产品"]
  },
  {
    id: "2026-05-18",
    date: "2026-05-18",
    quoteEn: "AI does not replace judgment; it raises the cost of shallow judgment.",
    quoteZh: "AI 不会替代判断力，它会提高浅层判断的代价。",
    author: "Daily Quotes Editorial",
    source: "AI Philosophy Notes",
    interpretation:
      "当生成变得便宜，真正稀缺的是定义问题、筛选答案和承担选择后果的能力。",
    category: "ai-philosophy",
    tags: ["AI 哲学", "判断力", "未来工作"]
  },
  {
    id: "2026-05-19",
    date: "2026-05-19",
    quoteEn: "A product is a promise repeated until it becomes trust.",
    quoteZh: "产品是一次承诺，被持续兑现之后才变成信任。",
    author: "Daily Quotes Editorial",
    source: "Product Notes",
    interpretation:
      "首版不需要华丽，但每一个可见承诺都要可靠。信任来自重复兑现，而不是一次惊艳。",
    category: "product",
    tags: ["产品", "信任", "MVP"]
  },
  {
    id: "2026-05-20",
    date: "2026-05-20",
    quoteEn: "You have power over your mind, not outside events.",
    quoteZh: "你能控制的是自己的心智，而不是外部事件。",
    author: "Marcus Aurelius",
    source: "Meditations",
    interpretation:
      "清晨最该确认的不是今天会发生什么，而是无论发生什么，你准备如何回应。",
    category: "stoicism",
    tags: ["斯多葛", "控制感", "清晨"]
  },
  {
    id: "2026-05-21",
    date: "2026-05-21",
    quoteEn: "The best strategy is the one your calendar can survive.",
    quoteZh: "最好的战略，是你的日程表真的承受得住的战略。",
    author: "Daily Quotes Editorial",
    source: "Business Growth Notes",
    interpretation:
      "战略不是愿望清单。它必须落到时间、注意力和取舍上，否则只是更漂亮的幻觉。",
    category: "business-growth",
    tags: ["商业成长", "战略", "取舍"]
  },
  {
    id: "2026-05-22",
    date: "2026-05-22",
    quoteEn: "Automation is leverage only after intention is clear.",
    quoteZh: "只有意图清晰之后，自动化才是杠杆。",
    author: "Daily Quotes Editorial",
    source: "AI Philosophy Notes",
    interpretation:
      "把模糊流程交给 AI，只会更快地产生噪音。先定义判断标准，再谈自动化。",
    category: "ai-philosophy",
    tags: ["AI 哲学", "自动化", "杠杆"]
  }
];
