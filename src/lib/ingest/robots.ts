/**
 * Minimal robots.txt parser for the ingest user agent (not a full crawler).
 */

export const INGEST_BOT_NAME = "SevaSaathiIngest";

export type RobotsRules = {
  disallow: string[];
  allow: string[];
  crawlDelaySec: number | null;
};

export type RobotsCacheEntry = {
  rules: RobotsRules;
  fetchedAt: number;
  raw?: string;
};

export type RobotsFetcher = (robotsUrl: string) => Promise<string>;

const DEFAULT_CACHE_TTL_MS = Number(process.env.ROBOTS_CACHE_TTL_MS ?? 6 * 60 * 60 * 1000);

/** In-memory cache keyed by origin (https://host). */
const cache = new Map<string, RobotsCacheEntry>();

export function clearRobotsCache() {
  cache.clear();
}

export function setRobotsCacheEntry(origin: string, entry: RobotsCacheEntry) {
  cache.set(origin, entry);
}

export function getRobotsCacheEntry(origin: string): RobotsCacheEntry | undefined {
  return cache.get(origin);
}

function originOf(url: string): string {
  const u = new URL(url);
  return u.origin;
}

function robotsUrlFor(url: string): string {
  const u = new URL(url);
  return `${u.origin}/robots.txt`;
}

function tokenMatches(agent: string, token: string): boolean {
  if (token === "*") return false;
  const a = agent.toLowerCase();
  const t = token.toLowerCase();
  return a === t || a.includes(t);
}

/** Parse robots.txt body for a specific user-agent (bot name + fallback *). */
export function parseRobotsTxt(body: string, userAgent: string): RobotsRules {
  const disallow: string[] = [];
  const allow: string[] = [];
  let crawlDelaySec: number | null = null;

  const blocks: { agents: string[]; lines: string[] }[] = [];
  let current: { agents: string[]; lines: string[] } | null = null;

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.split("#")[0].trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (key === "user-agent") {
      if (!current || current.lines.length > 0) {
        current = { agents: [value], lines: [] };
        blocks.push(current);
      } else {
        current.agents.push(value);
      }
      continue;
    }
    if (!current) continue;
    current.lines.push(`${key}:${value}`);
  }

  let picked =
    blocks.find((b) => b.agents.some((a) => tokenMatches(userAgent, a))) ??
    blocks.find((b) => b.agents.some((a) => a === "*")) ??
    null;

  if (picked) {
    for (const line of picked.lines) {
      const i = line.indexOf(":");
      const k = line.slice(0, i).trim().toLowerCase();
      const v = line.slice(i + 1).trim();
      if (k === "disallow" && v) disallow.push(v);
      if (k === "allow" && v) allow.push(v);
      if (k === "crawl-delay") {
        const n = Number(v);
        if (!Number.isNaN(n) && n >= 0) crawlDelaySec = n;
      }
    }
  }

  return { disallow, allow, crawlDelaySec };
}

function pathOf(url: string): string {
  const u = new URL(url);
  return u.pathname || "/";
}

/** RFC-inspired path match with * wildcard. */
export function pathAllowedByRules(path: string, rules: RobotsRules): boolean {
  const matches = (pattern: string) => {
    if (!pattern) return false;
    if (pattern === "/") return true;
    const regex = new RegExp(
      `^${pattern
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\\\*/g, ".*")}`,
    );
    return regex.test(path);
  };

  let bestAllow = -1;
  let bestDisallow = -1;
  for (const a of rules.allow) {
    if (matches(a)) bestAllow = Math.max(bestAllow, a.length);
  }
  for (const d of rules.disallow) {
    if (matches(d)) bestDisallow = Math.max(bestDisallow, d.length);
  }
  if (bestAllow === -1 && bestDisallow === -1) return true;
  return bestAllow >= bestDisallow;
}

export async function loadRobotsForUrl(
  pageUrl: string,
  fetcher: RobotsFetcher,
  userAgent = INGEST_BOT_NAME,
  cacheTtlMs = DEFAULT_CACHE_TTL_MS,
): Promise<RobotsRules> {
  const origin = originOf(pageUrl);
  const cached = cache.get(origin);
  if (cached && Date.now() - cached.fetchedAt < cacheTtlMs) {
    return cached.rules;
  }

  const robotsUrl = robotsUrlFor(pageUrl);
  let body = "";
  try {
    body = await fetcher(robotsUrl);
  } catch {
    const rules = { disallow: [], allow: [], crawlDelaySec: null };
    cache.set(origin, { rules, fetchedAt: Date.now() });
    return rules;
  }

  const rules = parseRobotsTxt(body, userAgent);
  cache.set(origin, { rules, fetchedAt: Date.now(), raw: body });
  return rules;
}

export async function isIngestUrlAllowed(
  pageUrl: string,
  fetcher: RobotsFetcher,
  userAgent = INGEST_BOT_NAME,
): Promise<{ allowed: boolean; reason?: string; crawlDelaySec: number | null }> {
  const rules = await loadRobotsForUrl(pageUrl, fetcher, userAgent);
  const path = pathOf(pageUrl);
  const allowed = pathAllowedByRules(path, rules);
  return {
    allowed,
    reason: allowed ? undefined : `robots.txt disallows ${path}`,
    crawlDelaySec: rules.crawlDelaySec,
  };
}
