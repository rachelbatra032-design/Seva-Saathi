#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Start Docker Compose and export DATABASE_URL.");
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const drizzleDir = path.join(root, "drizzle");

const direction = process.argv[2] === "down" ? "down" : "up";

const all = await readdir(drizzleDir);
const files =
  direction === "down"
    ? all
        .filter((f) => f.endsWith(".down.sql"))
        .sort()
        .reverse()
    : all.filter((f) => f.endsWith(".sql") && !f.endsWith(".down.sql")).sort();

const sql = postgres(url, { max: 1 });
try {
  for (const file of files) {
    const body = await readFile(path.join(drizzleDir, file), "utf8");
    await sql.unsafe(body);
    console.log(`Migration ${direction}:`, file);
  }
} finally {
  await sql.end({ timeout: 5 });
}
