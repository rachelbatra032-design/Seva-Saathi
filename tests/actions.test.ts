import { test } from "node:test";
import assert from "node:assert/strict";
import { grantMockConsent, prefillForJourney } from "../src/lib/actions/stubs";

test("mock consent is short-lived and labelled", () => {
  const g = grantMockConsent({ scope: "digilocker-read-metadata" });
  assert.match(g.mockToken, /^mock_/);
  assert.ok(g.label.includes("roadmap") || g.label.includes("DigiLocker"));
});

test("prefill returns deep links only", () => {
  const p = prefillForJourney("lost-aadhaar-or-pan", { previousName: "Test" });
  assert.ok(p);
  assert.ok(p!.deepLinks.length > 0);
  assert.match(p!.disclaimer, /does not submit/);
});
