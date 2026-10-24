import { test } from "node:test";
import assert from "node:assert/strict";
import { databaseConfigured, getDb } from "../src/db/client";

test("without DATABASE_URL the app uses file fallback", () => {
  const prev = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  assert.equal(databaseConfigured(), false);
  assert.equal(getDb(), null);
  if (prev) process.env.DATABASE_URL = prev;
});
