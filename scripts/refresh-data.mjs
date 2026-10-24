#!/usr/bin/env node
// Checks every official URL in our data set and snapshots page titles/descriptions.
// Output: src/data/generated/link-status.json and official-snippets.json
// Usage: npm run data:refresh
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { centralServices } = await import(path.join(root, "src/data/services-central.ts"));
const { stateServices } = await import(path.join(root, "src/data/services-states.ts"));
const { journeys } = await import(path.join(root, "src/data/journeys.ts"));

const urls = new Set();
for (const s of [...centralServices, ...stateServices]) urls.add(s.url);
for (const j of journeys) for (const st of j.steps) for (const l of st.links) urls.add(l.url);
urls.add("https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=3");
urls.add("https://apisetu.gov.in/");

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36 IndiaGovLinkCheck/1.0";
const TIMEOUT = Number(process.env.CHECK_TIMEOUT_MS ?? 30000);

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

function extract(html) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const desc =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1];
  const headings = [...html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi)]
    .map((m) => decode(m[1].replace(/<[^>]+>/g, " ")))
    .filter((t) => t.length > 3 && t.length < 140)
    .slice(0, 6);
  return {
    title: title ? decode(title) : undefined,
    description: desc ? decode(desc) : undefined,
    headings: headings.length ? headings : undefined,
  };
}

async function check(url) {
  const checkedAt = new Date().toISOString();
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml,*/*" },
    });
    const type = res.headers.get("content-type") ?? "";
    const status = res.status < 400 ? "ok" : [401, 403, 406, 429].includes(res.status) ? "blocked" : "unreachable";
    let snippet;
    if (status === "ok" && /html/i.test(type)) {
      snippet = extract((await res.text()).slice(0, 400000));
    }
    return { url, check: { status, httpCode: res.status, checkedAt, finalUrl: res.url !== url ? res.url : undefined }, snippet };
  } catch (err) {
    const code = err?.cause?.code ?? err?.name ?? "error";
    return { url, check: { status: "unreachable", reason: String(code), checkedAt } };
  }
}

const list = [...urls];
const results = [];
let i = 0;
async function worker() {
  while (i < list.length) {
    const url = list[i++];
    const r = await check(url);
    results.push(r);
    console.log(r.check.status.padEnd(12), r.check.httpCode ?? r.check.reason ?? "", url);
  }
}
await Promise.all(Array.from({ length: 12 }, worker));

const linkStatus = {};
const snippets = {};
for (const r of results.sort((a, b) => a.url.localeCompare(b.url))) {
  linkStatus[r.url] = r.check;
  if (r.snippet && (r.snippet.title || r.snippet.description)) {
    snippets[r.url] = { url: r.url, ...r.snippet, fetchedAt: r.check.checkedAt };
  }
}
const out = path.join(root, "src/data/generated");
await mkdir(out, { recursive: true });
await writeFile(path.join(out, "link-status.json"), JSON.stringify(linkStatus, null, 2) + "\n");
await writeFile(path.join(out, "official-snippets.json"), JSON.stringify(snippets, null, 2) + "\n");
const counts = results.reduce((a, r) => ((a[r.check.status] = (a[r.check.status] ?? 0) + 1), a), {});
console.log("done", counts, "snippets:", Object.keys(snippets).length);
