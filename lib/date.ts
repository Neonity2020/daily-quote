import { quotes } from "@/data/quotes";

export function getTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

export function getQuoteForToday() {
  const today = getTodayKey();
  const exact = quotes.find((quote) => quote.date === today);

  if (exact) {
    return exact;
  }

  const dayIndex = Math.floor(Date.now() / 86_400_000) % quotes.length;
  return quotes[dayIndex];
}
