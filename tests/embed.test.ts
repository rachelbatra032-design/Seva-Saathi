import { test } from "node:test";
import assert from "node:assert/strict";
import { cosineSimilarity, mockEmbed } from "../src/lib/ingest/embed";

test("mock embeddings are deterministic", () => {
  const a = mockEmbed("test");
  const b = mockEmbed("test");
  assert.equal(a.length, 384);
  assert.deepEqual(a, b);
});

test("cosine similarity is 1 for identical vectors", () => {
  const v = mockEmbed("x");
  assert.ok(cosineSimilarity(v, v) > 0.99);
});
