import { test } from "node:test";
import assert from "node:assert/strict";
import { clearRobotsCache, setRobotsCacheEntry } from "../src/lib/ingest/robots";
import { clearHostRateLimits } from "../src/lib/ingest/host-rate-limit";
import { ingestPoliteFetch, RobotsDisallowedError } from "../src/lib/ingest/fetch";

test("ingestPoliteFetch rejects URLs disallowed by robots.txt", async () => {
  clearRobotsCache();
  clearHostRateLimits();
  setRobotsCacheEntry("https://crawl.example.gov.in", {
    fetchedAt: Date.now(),
    rules: { disallow: ["/no-ingest/"], allow: [], crawlDelaySec: 0 },
  });

  await assert.rejects(
    () =>
      ingestPoliteFetch("https://crawl.example.gov.in/no-ingest/page.html", {
        robotsFetcher: async () => {
          throw new Error("unused");
        },
      }),
    (err: unknown) => err instanceof RobotsDisallowedError,
  );
});
