const buckets = new Map<string, { count: number; reset: number }>();

/** Best-effort, per-instance limiter to protect paid API keys from casual abuse. */
export function rateLimit(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

export function clientKey(req: Request): string {
  return (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
}
