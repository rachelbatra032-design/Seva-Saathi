import { createHash } from "node:crypto";
import { hostFromUrl, waitForHostSlot } from "@/lib/ingest/host-rate-limit";
import { INGEST_BOT_NAME, isIngestUrlAllowed, type RobotsFetcher } from "@/lib/ingest/robots";

export const DEFAULT_INGEST_UA =
  process.env.FEED_USER_AGENT ??
  `Mozilla/5.0 (compatible; ${INGEST_BOT_NAME}/1.0; +https://github.com/seva-saathi; unofficial aggregator)`;

const MIN_DELAY_MS = Number(process.env.INGEST_DELAY_MS ?? 1200);
const HOST_DELAY_MS = Number(process.env.INGEST_HOST_DELAY_MS ?? 1500);
let lastFetchAt = 0;

async function globalPoliteWait() {
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

export class RobotsDisallowedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RobotsDisallowedError";
  }
}

async function defaultRobotsFetcher(robotsUrl: string): Promise<string> {
  const res = await fetch(robotsUrl, {
    signal: AbortSignal.timeout(15_000),
    headers: { "user-agent": DEFAULT_INGEST_UA, accept: "text/plain,*/*" },
  });
  if (!res.ok) return "";
  return res.text();
}

export async function rawFetch(url: string, timeoutMs = 25_000): Promise<FetchResult> {
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "user-agent": DEFAULT_INGEST_UA,
      accept: "application/rss+xml, application/xml, text/xml, text/html, */*",
    },
  });
  const text = await res.text();
  const hash = createHash("sha256").update(text).digest("hex");
  return { url: res.url, status: res.status, contentType: res.headers.get("content-type") ?? "", text, hash };
}

/** Default fetch for trusted feeds (still rate-limited globally). */
export async function politeFetch(url: string, timeoutMs = 25_000): Promise<FetchResult> {
  await globalPoliteWait();
  return rawFetch(url, timeoutMs);
}

export type IngestFetchOptions = {
  robotsFetcher?: RobotsFetcher;
  respectRobots?: boolean;
  hostDelayMs?: number;
};

/**
 * Fetch for INGEST_URLS: robots.txt check, per-host crawl-delay + rate limit.
 */
export async function ingestPoliteFetch(
  url: string,
  opts: IngestFetchOptions = {},
  timeoutMs = 25_000,
): Promise<FetchResult> {
  const respectRobots = opts.respectRobots ?? true;
  const robotsFetcher = opts.robotsFetcher ?? defaultRobotsFetcher;
  const hostDelay = opts.hostDelayMs ?? HOST_DELAY_MS;

  if (respectRobots) {
    const check = await isIngestUrlAllowed(url, robotsFetcher);
    if (!check.allowed) {
      throw new RobotsDisallowedError(check.reason ?? "Blocked by robots.txt");
    }
    const crawlMs = check.crawlDelaySec != null ? check.crawlDelaySec * 1000 : 0;
    await waitForHostSlot(hostFromUrl(url), Math.max(hostDelay, crawlMs));
  } else {
    await waitForHostSlot(hostFromUrl(url), hostDelay);
  }

  await globalPoliteWait();
  return rawFetch(url, timeoutMs);
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
