"use client";

import {
  Bell,
  BellOff,
  CalendarDays,
  Check,
  Copy,
  ExternalLink,
  Heart,
  Home,
  Image as ImageIcon,
  RefreshCw,
  Share2,
  Star,
  TrendingUp
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { categoryLabels, Quote, quotes } from "@/data/quotes";
import { getQuoteForToday } from "@/lib/date";
import {
  readFavorites,
  readReminder,
  ReminderSettings,
  writeFavorites,
  writeReminder
} from "@/lib/storage";
import type { TrendItem, TrendSource } from "@/lib/trends";

type Tab = "today" | "trends" | "history" | "favorites";
type ShareTemplate = "editorial" | "signal" | "stoic";

const shareTemplates: Array<{
  id: ShareTemplate;
  name: string;
  description: string;
}> = [
  { id: "editorial", name: "Editorial", description: "朋友圈 / 即刻" },
  { id: "signal", name: "Signal", description: "AI / 技术观点" },
  { id: "stoic", name: "Stoic", description: "哲学 / 清晨" }
];

export function DailyQuotesApp() {
  const [todayQuote, setTodayQuote] = useState<Quote>(quotes[0]);
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [reminder, setReminder] = useState<ReminderSettings>({
    enabled: false,
    time: "06:30",
    permission: "default"
  });
  const [toast, setToast] = useState("");
  const [shareQuote, setShareQuote] = useState<Quote | null>(null);

  useEffect(() => {
    setTodayQuote(getQuoteForToday());
    setFavorites(readFavorites());
    setReminder(readReminder());
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(""), 1600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const favoriteQuotes = quotes.filter((quote) => favorites.includes(quote.id));

  function toggleFavorite(id: string) {
    const next = favorites.includes(id)
      ? favorites.filter((favoriteId) => favoriteId !== id)
      : [id, ...favorites];

    setFavorites(next);
    writeFavorites(next);
    setToast(next.includes(id) ? "已收藏" : "已取消收藏");
  }

  async function copyQuote(quote: Quote) {
    const text = `“${quote.quoteEn}”\n${quote.quoteZh}\n\n-- ${quote.author}${quote.source ? `, ${quote.source}` : ""}\n每日金句 · ${quote.date}`;
    await navigator.clipboard.writeText(text);
    setToast("已复制分享文本");
  }

  async function toggleReminder() {
    if (!("Notification" in window)) {
      const next: ReminderSettings = {
        enabled: false,
        time: "06:30",
        permission: "unsupported"
      };
      setReminder(next);
      writeReminder(next);
      setToast("当前浏览器不支持通知");
      return;
    }

    const permission =
      Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;

    const next: ReminderSettings = {
      enabled: permission === "granted" ? !reminder.enabled : false,
      time: "06:30",
      permission
    };

    setReminder(next);
    writeReminder(next);
    setToast(
      permission === "granted"
        ? next.enabled
          ? "每日提醒已开启"
          : "每日提醒已关闭"
        : "通知权限未开启"
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">06:30 daily signal</p>
          <h1>每日金句</h1>
        </div>
        <button
          className="icon-button"
          type="button"
          aria-label="设置每日提醒"
          onClick={toggleReminder}
        >
          {reminder.enabled ? <Bell size={20} /> : <BellOff size={20} />}
        </button>
      </header>

      {activeTab === "today" && (
        <TodayView
          quote={todayQuote}
          isFavorite={favorites.includes(todayQuote.id)}
          reminder={reminder}
          onFavorite={() => toggleFavorite(todayQuote.id)}
          onCopy={() => copyQuote(todayQuote)}
          onShare={() => setShareQuote(todayQuote)}
          onReminder={toggleReminder}
        />
      )}

      {activeTab === "history" && (
        <HistoryView
          favorites={favorites}
          onFavorite={toggleFavorite}
          onCopy={copyQuote}
          onShare={setShareQuote}
        />
      )}

      {activeTab === "trends" && <TrendsView onToast={setToast} />}

      {activeTab === "favorites" && (
        <FavoritesView
          quotes={favoriteQuotes}
          favorites={favorites}
          onFavorite={toggleFavorite}
          onCopy={copyQuote}
          onShare={setShareQuote}
          onGoToday={() => setActiveTab("today")}
        />
      )}

      <nav className="bottom-nav" aria-label="主导航">
        <NavButton
          label="今日"
          icon={<Home size={20} />}
          active={activeTab === "today"}
          onClick={() => setActiveTab("today")}
        />
        <NavButton
          label="趋势"
          icon={<TrendingUp size={20} />}
          active={activeTab === "trends"}
          onClick={() => setActiveTab("trends")}
        />
        <NavButton
          label="历史"
          icon={<CalendarDays size={20} />}
          active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
        />
        <NavButton
          label="收藏"
          icon={<Heart size={20} />}
          active={activeTab === "favorites"}
          onClick={() => setActiveTab("favorites")}
        />
      </nav>

      {shareQuote && (
        <ShareSheet
          quote={shareQuote}
          onClose={() => setShareQuote(null)}
          onToast={setToast}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function TodayView({
  quote,
  isFavorite,
  reminder,
  onFavorite,
  onCopy,
  onShare,
  onReminder
}: {
  quote: Quote;
  isFavorite: boolean;
  reminder: ReminderSettings;
  onFavorite: () => void;
  onCopy: () => void;
  onShare: () => void;
  onReminder: () => void;
}) {
  return (
    <section className="page-stack">
      <QuoteHero quote={quote} />

      <section className="action-grid" aria-label="今日操作">
        <button className="secondary-button" type="button" onClick={onFavorite}>
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
          {isFavorite ? "已收藏" : "收藏"}
        </button>
        <button className="secondary-button" type="button" onClick={onCopy}>
          <Copy size={18} />
          复制
        </button>
        <button className="primary-button" type="button" onClick={onShare}>
          <ImageIcon size={18} />
          分享图
        </button>
      </section>

      <section className="reminder-strip">
        <div>
          <p className="strip-title">每日提醒</p>
          <p className="strip-copy">
            默认 06:30，当前状态：
            {reminder.permission === "unsupported"
              ? "不支持"
              : reminder.enabled
                ? "已开启"
                : "未开启"}
          </p>
        </div>
        <button className="mini-button" type="button" onClick={onReminder}>
          {reminder.enabled ? "关闭" : "开启"}
        </button>
      </section>

      <section className="coming-soon">
        <div className="soon-icon">
          <TrendingUp size={18} />
        </div>
        <div>
          <p className="strip-title">趋势聚合</p>
          <p className="strip-copy">
            GitHub Trending / Hacker News 已接入独立趋势页。
          </p>
        </div>
      </section>
    </section>
  );
}

function QuoteHero({ quote }: { quote: Quote }) {
  return (
    <article className="quote-hero">
      <div className="quote-meta">
        <span>{quote.date}</span>
        <span>{categoryLabels[quote.category]}</span>
      </div>
      <p className="quote-en">{quote.quoteEn}</p>
      <p className="quote-zh">{quote.quoteZh}</p>
      <div className="quote-source">
        <span>{quote.author}</span>
        {quote.sourceUrl ? (
          <a href={quote.sourceUrl} target="_blank" rel="noreferrer">
            {quote.source}
          </a>
        ) : (
          quote.source && <span>{quote.source}</span>
        )}
      </div>
      <p className="interpretation">{quote.interpretation}</p>
      <Provenance quote={quote} />
      <div className="tag-row">
        {quote.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

function HistoryView({
  favorites,
  onFavorite,
  onCopy,
  onShare
}: {
  favorites: string[];
  onFavorite: (id: string) => void;
  onCopy: (quote: Quote) => void;
  onShare: (quote: Quote) => void;
}) {
  return (
    <section className="page-stack">
      <PageTitle
        eyebrow="Archive"
        title="历史金句"
        copy="按日期回看最近的每日金句。"
      />
      <div className="quote-list">
        {[...quotes].reverse().map((quote) => (
          <QuoteListItem
            key={quote.id}
            quote={quote}
            isFavorite={favorites.includes(quote.id)}
            onFavorite={() => onFavorite(quote.id)}
            onCopy={() => onCopy(quote)}
            onShare={() => onShare(quote)}
          />
        ))}
      </div>
    </section>
  );
}

function FavoritesView({
  quotes: favoriteQuotes,
  favorites,
  onFavorite,
  onCopy,
  onShare,
  onGoToday
}: {
  quotes: Quote[];
  favorites: string[];
  onFavorite: (id: string) => void;
  onCopy: (quote: Quote) => void;
  onShare: (quote: Quote) => void;
  onGoToday: () => void;
}) {
  return (
    <section className="page-stack">
      <PageTitle
        eyebrow={`${favoriteQuotes.length} saved`}
        title="我的收藏"
        copy="把值得反复看的句子留在这里。"
      />

      {favoriteQuotes.length === 0 ? (
        <section className="empty-state">
          <Star size={28} />
          <p>还没有收藏。</p>
          <button className="mini-button" type="button" onClick={onGoToday}>
            回到今日
          </button>
        </section>
      ) : (
        <div className="quote-list">
          {favoriteQuotes.map((quote) => (
            <QuoteListItem
              key={quote.id}
              quote={quote}
              isFavorite={favorites.includes(quote.id)}
              onFavorite={() => onFavorite(quote.id)}
              onCopy={() => onCopy(quote)}
              onShare={() => onShare(quote)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function TrendsView({ onToast }: { onToast: (message: string) => void }) {
  const [source, setSource] = useState<TrendSource>("github");
  const [items, setItems] = useState<TrendItem[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadTrends(source);
  }, [source]);

  async function loadTrends(nextSource = source) {
    setIsLoading(true);
    setError("");

    try {
      const endpoint =
        nextSource === "github"
          ? "/api/trends/github"
          : "/api/trends/hacker-news";
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error("趋势数据加载失败");
      }

      const data = (await response.json()) as {
        updatedAt: string;
        items: TrendItem[];
      };

      setItems(data.items);
      setUpdatedAt(data.updatedAt);
    } catch {
      setItems([]);
      setError("当前无法加载趋势数据。");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyTrendInsight(item: TrendItem) {
    await navigator.clipboard.writeText(
      `${item.title}\n${item.insight}\n${item.url}`
    );
    onToast("已复制趋势洞察");
  }

  return (
    <section className="page-stack">
      <PageTitle
        eyebrow="Trend radar"
        title="趋势聚合"
        copy="从 GitHub 新项目和 Hacker News 热门讨论里提取可观察信号。"
      />

      <section className="trend-toolbar">
        <div className="segmented-control" aria-label="趋势来源">
          <button
            className={source === "github" ? "active" : ""}
            type="button"
            onClick={() => setSource("github")}
          >
            GitHub
          </button>
          <button
            className={source === "hacker-news" ? "active" : ""}
            type="button"
            onClick={() => setSource("hacker-news")}
          >
            HN
          </button>
        </div>
        <button
          className="mini-button"
          type="button"
          onClick={() => loadTrends()}
          disabled={isLoading}
        >
          <RefreshCw size={16} />
          刷新
        </button>
      </section>

      {updatedAt && (
        <p className="trend-updated">
          Updated {new Date(updatedAt).toLocaleString("zh-CN")}
        </p>
      )}

      {isLoading && (
        <section className="trend-state">
          <TrendingUp size={24} />
          <p>正在加载趋势信号。</p>
        </section>
      )}

      {error && (
        <section className="trend-state">
          <TrendingUp size={24} />
          <p>{error}</p>
          <button className="mini-button" type="button" onClick={() => loadTrends()}>
            重试
          </button>
        </section>
      )}

      {!isLoading && !error && (
        <div className="trend-list">
          {items.map((item) => (
            <TrendCard
              key={`${item.source}-${item.id}`}
              item={item}
              onCopy={() => copyTrendInsight(item)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function TrendCard({
  item,
  onCopy
}: {
  item: TrendItem;
  onCopy: () => void;
}) {
  return (
    <article className="trend-card">
      <div className="trend-card-head">
        <span>{item.source === "github" ? "GitHub" : "Hacker News"}</span>
        {item.language && <span>{item.language}</span>}
      </div>
      <h3>{item.title}</h3>
      <p className="trend-description">{item.description}</p>
      <p className="trend-insight">{item.insight}</p>
      <div className="trend-metrics">
        <span>{item.score.toLocaleString()} points</span>
        <span>{item.meta}</span>
      </div>
      <div className="trend-actions">
        <a href={item.url} target="_blank" rel="noreferrer">
          <ExternalLink size={16} />
          打开来源
        </a>
        <button type="button" onClick={onCopy}>
          <Copy size={16} />
          复制洞察
        </button>
      </div>
    </article>
  );
}

function QuoteListItem({
  quote,
  isFavorite,
  onFavorite,
  onCopy,
  onShare
}: {
  quote: Quote;
  isFavorite: boolean;
  onFavorite: () => void;
  onCopy: () => void;
  onShare: () => void;
}) {
  return (
    <article className="quote-list-item">
      <div className="quote-meta">
        <span>{quote.date}</span>
        <span>{categoryLabels[quote.category]}</span>
      </div>
      <p className="list-quote-en">{quote.quoteEn}</p>
      <p className="list-quote-zh">{quote.quoteZh}</p>
      <div className="list-source">
        <small>{quote.author}</small>
        {quote.sourceUrl ? (
          <a href={quote.sourceUrl} target="_blank" rel="noreferrer">
            来源
          </a>
        ) : (
          <span>原创</span>
        )}
      </div>
      <Provenance quote={quote} compact />
      <div className="list-actions">
        <button type="button" onClick={onFavorite} aria-label="收藏">
          <Heart size={17} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        <button type="button" onClick={onCopy} aria-label="复制">
          <Copy size={17} />
        </button>
        <button type="button" onClick={onShare} aria-label="生成分享图">
          <Share2 size={17} />
        </button>
      </div>
    </article>
  );
}

function Provenance({
  quote,
  compact = false
}: {
  quote: Quote;
  compact?: boolean;
}) {
  const label =
    quote.verification === "external-source"
      ? "外部来源"
      : quote.verification === "editorial-original"
        ? "编辑部原创"
        : "待复核";

  return (
    <section className={compact ? "provenance compact" : "provenance"}>
      <span>{label}</span>
      <p>{quote.provenance}</p>
    </section>
  );
}

function ShareSheet({
  quote,
  onClose,
  onToast
}: {
  quote: Quote;
  onClose: () => void;
  onToast: (message: string) => void;
}) {
  const [template, setTemplate] = useState<ShareTemplate>("editorial");
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    drawShareImage(canvasRef.current, quote, template);
  }, [quote, template]);

  async function saveImage() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    setIsGenerating(true);
    drawShareImage(canvas, quote, template);
    await new Promise((resolve) => window.setTimeout(resolve, 150));

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsGenerating(false);
        onToast("分享图生成失败");
        return;
      }

      const file = new File([blob], `daily-quote-${quote.date}.png`, {
        type: "image/png"
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "每日金句",
          text: quote.quoteEn,
          files: [file]
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
      }

      setIsGenerating(false);
      onToast("分享图已生成");
    }, "image/png");
  }

  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <section
        className="share-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="生成分享图"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-header">
          <div>
            <p className="eyebrow">Share card</p>
            <h2>选择模板</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="关闭">
            <Check size={20} />
          </button>
        </div>

        <div className="template-tabs">
          {shareTemplates.map((item) => (
            <button
              className={item.id === template ? "template-tab active" : "template-tab"}
              type="button"
              key={item.id}
              onClick={() => setTemplate(item.id)}
            >
              <span>{item.name}</span>
              <small>{item.description}</small>
            </button>
          ))}
        </div>

        <canvas
          className="share-canvas"
          ref={canvasRef}
          width={1080}
          height={1440}
          aria-label="分享图预览"
        />

        <button
          className="primary-button wide"
          type="button"
          disabled={isGenerating}
          onClick={saveImage}
        >
          <ImageIcon size={18} />
          {isGenerating ? "生成中" : "保存 / 分享图片"}
        </button>
      </section>
    </div>
  );
}

function PageTitle({
  eyebrow,
  title,
  copy
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="page-title">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{copy}</p>
    </section>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={active ? "nav-button active" : "nav-button"}
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function drawShareImage(
  canvas: HTMLCanvasElement | null,
  quote: Quote,
  template: ShareTemplate
) {
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  const theme = {
    editorial: {
      background: "#F7F4EF",
      text: "#171717",
      muted: "#69655F",
      accent: "#1F6F5B"
    },
    signal: {
      background: "#F8FAFC",
      text: "#101828",
      muted: "#667085",
      accent: "#3B5CCC"
    },
    stoic: {
      background: "#EFE7DA",
      text: "#221C16",
      muted: "#75675A",
      accent: "#8A5A2B"
    }
  }[template];

  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (template === "signal") {
    ctx.fillStyle = theme.accent;
    ctx.fillRect(84, 120, 10, 1010);
  }

  ctx.fillStyle = theme.accent;
  ctx.font = "600 34px Inter, system-ui, sans-serif";
  ctx.fillText("每日金句", 96, 132);

  ctx.fillStyle = theme.muted;
  ctx.font = "500 30px Inter, system-ui, sans-serif";
  ctx.fillText(`${quote.date} / ${categoryLabels[quote.category]}`, 96, 188);

  ctx.fillStyle = theme.text;
  ctx.font =
    template === "stoic"
      ? "600 78px Georgia, serif"
      : "650 74px Inter, system-ui, sans-serif";
  drawWrappedText(ctx, quote.quoteEn, 96, 400, 888, 90, 7);

  ctx.fillStyle = theme.muted;
  ctx.font = "400 40px PingFang SC, Microsoft YaHei, sans-serif";
  drawWrappedText(ctx, quote.quoteZh, 96, 860, 888, 62, 4);

  ctx.fillStyle = theme.text;
  ctx.font = "600 32px Inter, system-ui, sans-serif";
  ctx.fillText(quote.author, 96, 1136);

  if (quote.source) {
    ctx.fillStyle = theme.muted;
    ctx.font = "400 30px Inter, system-ui, sans-serif";
    drawWrappedText(ctx, quote.source, 96, 1184, 760, 42, 2);
  }

  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(96, 1276);
  ctx.lineTo(984, 1276);
  ctx.stroke();

  ctx.fillStyle = theme.muted;
  ctx.font = "500 28px Inter, system-ui, sans-serif";
  ctx.fillText("Daily quote for builders, thinkers, and operators.", 96, 1340);
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(/\s+/);
  const isCjk = /[\u4e00-\u9fff]/.test(text);
  const units = isCjk ? Array.from(text) : words;
  let line = "";
  let lines = 0;

  for (const unit of units) {
    const candidate = isCjk ? `${line}${unit}` : line ? `${line} ${unit}` : unit;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      ctx.fillText(line, x, y + lines * lineHeight);
      line = unit;
      lines += 1;

      if (lines >= maxLines) {
        return;
      }
    } else {
      line = candidate;
    }
  }

  if (line && lines < maxLines) {
    ctx.fillText(line, x, y + lines * lineHeight);
  }
}
