import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { answerQuery } from "../src/lib/assistant/answer";
import { databaseConfigured } from "../src/db/client";
import { isOfficialUrl } from "../src/lib/official-hosts";

type EvalCase = {
  q: string;
  expectIntent: string;
  expectJourney?: string;
  minCitations?: number;
  refused?: boolean;
};

if (!databaseConfigured()) {
  test("eval-db skipped without DATABASE_URL", () => {
    assert.ok(true);
  });
} else {
  const evalPath = path.join(process.cwd(), "evals/ask-eval.json");
  const cases: EvalCase[] = JSON.parse(readFileSync(evalPath, "utf8"));

  for (const c of cases) {
    test(`eval-db: ${c.q.slice(0, 48)}`, async () => {
      const r = await answerQuery(c.q);
      assert.equal(r.intent, c.expectIntent);
      if (c.expectJourney) assert.equal(r.journeySlug, c.expectJourney);
      if (c.refused) {
        assert.equal(r.grounded, false);
      } else if (c.minCitations) {
        assert.ok(r.citations.length >= c.minCitations);
        for (const cit of r.citations) assert.ok(isOfficialUrl(cit.url));
      }
    });
  }
}
