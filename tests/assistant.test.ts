import { test } from "node:test";
import assert from "node:assert/strict";
import { answerQuery } from "../src/lib/assistant/answer";
import { isOfficialUrl } from "../src/lib/official-hosts";

const cases: { q: string; intent: string; journey?: string; service?: string }[] = [
  { q: "I just got married, how do I change my name?", intent: "journey", journey: "name-change-after-marriage" },
  { q: "changing my surname after wedding", intent: "journey", journey: "name-change-after-marriage" },
  { q: "I lost my Aadhaar card", intent: "journey", journey: "lost-aadhaar-or-pan" },
  { q: "lost my PAN card, how to get a duplicate", intent: "journey", journey: "lost-aadhaar-or-pan" },
  { q: "I am moving to another state", intent: "journey", journey: "moving-to-another-state" },
  { q: "how do I apply for a scholarship", intent: "services", service: "national-scholarship-portal" },
  { q: "gst registration", intent: "services", service: "gst-portal" },
  { q: "farmer income support", intent: "services", service: "pm-kisan" },
  { q: "what is the best pizza in mumbai", intent: "refusal" },
  { q: "which stock should I buy", intent: "refusal" },
  { q: "what is the status of my passport application", intent: "refusal" },
  { q: "hello", intent: "refusal" },
];

for (const c of cases) {
  test(`routes: ${c.q}`, async () => {
    const r = await answerQuery(c.q);
    assert.equal(r.intent, c.intent);
    if (c.journey) assert.equal(r.journeySlug, c.journey);
    if (c.service) assert.ok(r.serviceSlugs.includes(c.service), `got ${r.serviceSlugs}`);
  });
}

test("every citation is an official URL and every [n] marker resolves", async () => {
  for (const c of cases) {
    const r = await answerQuery(c.q);
    for (const cit of r.citations) assert.ok(isOfficialUrl(cit.url), cit.url);
    const nums = new Set(r.citations.map((x) => x.n));
    for (const m of r.text.matchAll(/\[(\d+)\]/g)) assert.ok(nums.has(Number(m[1])), `${c.q}: dangling [${m[1]}]`);
    if (r.grounded) assert.ok(r.citations.length > 0, `${c.q}: grounded answer without citations`);
  }
});

test("refusals are never marked grounded and always point to an official site", async () => {
  const r = await answerQuery("what is the best pizza in mumbai");
  assert.equal(r.grounded, false);
  assert.ok(r.citations.some((c) => c.url === "https://www.india.gov.in/"));
  assert.match(r.text, /will not guess/);
});

test("journey answers list steps in dependency order", async () => {
  const r = await answerQuery("I just got married, how do I change my name?");
  const order = ["marriage certificate", "Aadhaar", "PAN", "passport"].map((k) => r.text.indexOf(k));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
});
