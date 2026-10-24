import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clearRobotsCache,
  isIngestUrlAllowed,
  parseRobotsTxt,
  pathAllowedByRules,
  setRobotsCacheEntry,
} from "../src/lib/ingest/robots";

const SAMPLE = `
User-agent: *
Disallow: /private/
Crawl-delay: 2

User-agent: SevaSaathiIngest
Disallow: /secret/
Allow: /secret/public/
Crawl-delay: 3
`;

test("parseRobotsTxt picks bot-specific group and crawl-delay", () => {
  const rules = parseRobotsTxt(SAMPLE, "SevaSaathiIngest");
  assert.ok(rules.disallow.includes("/secret/"));
  assert.ok(rules.allow.includes("/secret/public/"));
  assert.equal(rules.crawlDelaySec, 3);
});

test("pathAllowedByRules honours allow over longer disallow", () => {
  const rules = parseRobotsTxt(SAMPLE, "SevaSaathiIngest");
  assert.equal(pathAllowedByRules("/secret/public/page", rules), true);
  assert.equal(pathAllowedByRules("/secret/internal", rules), false);
});

test("isIngestUrlAllowed uses cached robots per host", async () => {
  clearRobotsCache();
  setRobotsCacheEntry("https://example.gov.in", {
    fetchedAt: Date.now(),
    rules: { disallow: ["/blocked/"], allow: [], crawlDelaySec: 1 },
  });

  const fetcher = async () => {
    throw new Error("should not fetch when cached");
  };

  const ok = await isIngestUrlAllowed("https://example.gov.in/ok/page", fetcher);
  assert.equal(ok.allowed, true);

  const blocked = await isIngestUrlAllowed("https://example.gov.in/blocked/file", fetcher);
  assert.equal(blocked.allowed, false);
  assert.match(blocked.reason ?? "", /robots/i);
});
