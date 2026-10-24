#!/usr/bin/env node
/** Fails if tracked files look like they contain API keys or .env secrets. */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SKIP = new Set(["node_modules", ".git", ".next", "LICENSE", "package-lock.json"]);
const PATTERNS = [
  /(?:^|[^A-Z0-9_])SARVAM_API_KEY\s*=\s*['"]?[a-zA-Z0-9_\-]{12,}/,
  /(?:^|[^A-Z0-9_])LLM_API_KEY\s*=\s*['"]?[a-zA-Z0-9_\-]{12,}/,
  /\bsk-[a-zA-Z0-9]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
];

async function walk(dir, files = []) {
  for (const name of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(name.name)) continue;
    const p = path.join(dir, name.name);
    if (name.isDirectory()) await walk(p, files);
    else files.push(p);
  }
  return files;
}

const files = await walk(root);
let failed = false;
for (const file of files) {
  if (file.endsWith(".png") || file.endsWith(".ico")) continue;
  const rel = path.relative(root, file);
  if (rel.startsWith("src/data/generated/")) continue;
  const text = await readFile(file, "utf8");
  for (const re of PATTERNS) {
    if (re.test(text)) {
      console.error("possible secret in", rel);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log("secret-scan: ok");
