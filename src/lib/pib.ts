import { cacheLife } from "next/cache";

export const PIB_FEED_URL = "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=3";
// PIB's CDN rejects clearly non-browser user agents, so default to a browser-like one.
// Fetches are cached for 15 minutes, so the request rate is very low.
const FEED_USER_AGENT =
  process.env.FEED_USER_AGENT ??
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export const PIB_HOME_URL = "https://pib.gov.in/";

export type FeedItem = {
  title: string;
  link: string;
};

export type FeedResult =
  | { ok: true; items: FeedItem[]; fetchedAt: string; source: string; sourceUrl: string }
  | { ok: false; error: string; source: string; sourceUrl: string };

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/[\u200b\u200c\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function parseRss(xml: string, limit: number): FeedItem[] {
  const items: FeedItem[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const title = m[1].match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const link = m[1].match(/<link>([\s\S]*?)<\/link>/)?.[1];
    if (!title || !link) continue;
    const url = decode(link);
    try {
      const host = new URL(url).hostname;
      if (!host.endsWith("pib.gov.in")) continue;
    } catch {
      continue;
    }
    items.push({ title: decode(title), link: url });
    if (items.length >= limit) break;
  }
  return items;
}

/** Throws on failure so the failed result is never written to the cache. */
async function fetchPibFeed(): Promise<{ items: FeedItem[]; fetchedAt: string }> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  const res = await fetch(PIB_FEED_URL, {
    headers: { "user-agent": FEED_USER_AGENT, accept: "application/rss+xml, text/xml" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`PIB responded with HTTP ${res.status}`);
  const xml = await res.text();
  const items = parseRss(xml, 30);
  if (!items.length) throw new Error("PIB feed returned no readable items");
  return { items, fetchedAt: new Date().toISOString() };
}

export async function getPibUpdates(limit = 12): Promise<FeedResult> {
  const base = { source: "Press Information Bureau (PIB)", sourceUrl: PIB_HOME_URL };
  try {
    const { items, fetchedAt } = await fetchPibFeed();
    return { ok: true, items: items.slice(0, limit), fetchedAt, ...base };
  } catch (err) {
    console.error("[pib] feed unavailable:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
      ...base,
    };
  }
}
