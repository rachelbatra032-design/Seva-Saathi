const hostLastFetch = new Map<string, number>();

export function clearHostRateLimits() {
  hostLastFetch.clear();
}

export function getHostLastFetch(host: string): number | undefined {
  return hostLastFetch.get(host);
}

/** Wait until per-host minimum interval has elapsed (includes robots crawl-delay). */
export async function waitForHostSlot(host: string, minIntervalMs: number) {
  const last = hostLastFetch.get(host) ?? 0;
  const wait = Math.max(0, minIntervalMs - (Date.now() - last));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  hostLastFetch.set(host, Date.now());
}

export function hostFromUrl(url: string): string {
  return new URL(url).host;
}
