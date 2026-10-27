import { test } from "node:test";
import assert from "node:assert/strict";
import { allServices, searchServices } from "../src/lib/services";

const all = { category: "all" as const, level: "all" as const, state: "all" };

test("passport returns the passport service and a short list", () => {
  const hits = searchServices({ ...all, query: "passport" });
  assert.ok(hits.some((s) => s.slug === "passport-seva"));
  assert.ok(hits.length > 0 && hits.length < 15, `too many hits: ${hits.length}`);
  assert.equal(hits[0]?.slug, "passport-seva");
});

test("a prefix of passport does not match the passport service", () => {
  const hits = searchServices({ ...all, query: "pass" });
  assert.equal(hits.some((s) => s.slug === "passport-seva"), false);
});

test("every meaningful word must match", () => {
  const hits = searchServices({ ...all, query: "passport ration" });
  assert.equal(hits.length, 0);
});

test("change my name does not return the whole directory", () => {
  const hits = searchServices({ ...all, query: "change my name" });
  assert.ok(hits.length > 0);
  assert.ok(hits.length < allServices.length / 2, `too many hits: ${hits.length}`);
  for (const service of hits) {
    const blob = `${service.title} ${service.summary} ${(service.tags ?? []).join(" ")}`.toLowerCase();
    assert.match(blob, /name|surname/);
    assert.match(blob, /change|rename|update/);
  }
});

test("an empty query returns every service", () => {
  const hits = searchServices({ ...all, query: " " });
  assert.equal(hits.length, allServices.length);
});
