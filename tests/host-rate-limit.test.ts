import { test } from "node:test";
import assert from "node:assert/strict";
import { clearHostRateLimits, getHostLastFetch, waitForHostSlot } from "../src/lib/ingest/host-rate-limit";

test("per-host rate limit enforces minimum interval", async () => {
  clearHostRateLimits();
  const host = "ingest.example.gov.in";
  await waitForHostSlot(host, 40);
  const first = getHostLastFetch(host);
  assert.ok(first);
  await waitForHostSlot(host, 40);
  const second = getHostLastFetch(host)!;
  assert.ok(second - first >= 35);
});
