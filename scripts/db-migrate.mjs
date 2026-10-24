#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Start Docker Compose and export DATABASE_URL.");
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sqlPath = path.join(root, "drizzle", "0000_init.sql");
const body = await readFile(sqlPath, "utf8");

const sql = postgres(url, { max: 1 });
try {
  await sql.unsafe(body);
  console.log("Migration applied:", sqlPath);
} finally {
  await sql.end({ timeout: 5 });
}
