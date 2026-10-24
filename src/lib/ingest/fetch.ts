import { createHash } from "node:crypto";

const DEFAULT_UA =
  process.env.FEED_USER_AGENT ??
  "Mozilla/5.0 (compatible; SevaSaathiIngest/1.0; +https://github.com/seva-saathi; unofficial aggregator)";

const MIN_DELAY_MS = Number(process.env.INGEST_DELAY_MS ?? 1200);
let lastFetchAt = 0;

async function politeWait() {
  const now = Date.now();
  const wait = Math.max(0, MIN_DELAY_MS - (now - lastFetchAt));
  if (wait) await new Promise((r) => setTimeout(r, wait));
  lastFetchAt = Date.now();
}

export type FetchResult = {
  url: string;
  status: number;
  contentType: string;
  text: string;
  hash: string;
};

export async function politeFetch(url: string, timeoutMs = 25_000): Promise<FetchResult> {
  await politeWait();
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "user-agent": DEFAULT_UA, accept: "application/rss+xml, application/xml, text/xml, text/html, */*" },
  });
  const text = await res.text();
  const hash = createHash("sha256").update(text).digest("hex");
  return { url: res.url, status: res.status, contentType: res.headers.get("content-type") ?? "", text, hash };
}

/** Strip HTML to short plain text for storage (not republication). */
export function htmlToSummary(html: string, maxLen = 500): string {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length > maxLen ? `${stripped.slice(0, maxLen - 1)}…` : stripped;
}

export function chunkText(text: string, size = 400, overlap = 80): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const slice = words.slice(i, i + size);
    chunks.push(slice.join(" "));
    i += size - overlap;
  }
  return chunks;
}
