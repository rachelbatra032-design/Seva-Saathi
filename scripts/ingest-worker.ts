#!/usr/bin/env npx tsx
/**
 * Ingestion worker: PIB RSS + optional seed URLs. Polite fetch, chunk, embed, upsert.
 * DATABASE_URL required. Run: npm run ingest
 */
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../src/db/schema";
import { chunkText, htmlToSummary, ingestPoliteFetch, politeFetch } from "../src/lib/ingest/fetch";
import { embedText } from "../src/lib/ingest/embed";

const PIB_RSS = "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=3";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL required for ingest worker");
  process.exit(1);
}

const client = postgres(url, { max: 3 });
const db = drizzle(client, { schema });

function parseRssItems(xml: string): { title: string; link: string; description: string }[] {
  const items: { title: string; link: string; description: string }[] = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  for (const block of blocks) {
    const title = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() ?? "";
    const link = block.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim() ?? "";
    const description =
      block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim() ?? "";
    if (title && link) items.push({ title, link, description: description.replace(/<[^>]+>/g, " ").trim() });
  }
  return items;
}

async function upsertSource(sourceUrl: string, agency: string, licence: string, hash: string) {
  const existing = await db.select().from(schema.sources).where(eq(schema.sources.url, sourceUrl)).limit(1);
  if (existing[0]) {
    await db
      .update(schema.sources)
      .set({ lastFetched: new Date(), contentHash: hash, agency, licence })
      .where(eq(schema.sources.id, existing[0].id));
    return existing[0].id;
  }
  const [row] = await db
    .insert(schema.sources)
    .values({ url: sourceUrl, agency, licence, lastFetched: new Date(), contentHash: hash })
    .returning({ id: schema.sources.id });
  return row.id;
}

async function ingestDocument(sourceId: string, title: string, body: string) {
  const hash = createHash("sha256").update(body).digest("hex");
  const [doc] = await db
    .insert(schema.documents)
    .values({ sourceId, title, fetchedAt: new Date() })
    .returning({ id: schema.documents.id });

  const pieces = chunkText(body, 120, 30);
  for (let ord = 0; ord < pieces.length; ord++) {
    const text = pieces[ord];
    const { vector } = await embedText(text);
    await db.insert(schema.chunks).values({
      documentId: doc.id,
      sourceId,
      ord,
      text,
      contentHash: createHash("sha256").update(text).digest("hex"),
      embedding: vector,
    });
  }
  return pieces.length;
}

if (process.env.INGEST_SKIP_PIB !== "1") {
  console.log("Ingest: PIB RSS");
  const feed = await politeFetch(PIB_RSS);
  if (feed.status >= 400) {
    console.error("PIB fetch failed", feed.status);
    process.exit(1);
  }

  const feedSourceId = await upsertSource(PIB_RSS, "PIB", "public RSS headline feed", feed.hash);
  const items = parseRssItems(feed.text);
  const summaryBody = items
    .slice(0, 40)
    .map((i) => `${i.title}. ${i.description}`.trim())
    .join("\n");
  const chunksWritten = await ingestDocument(feedSourceId, "PIB RSS headlines", summaryBody || htmlToSummary(feed.text));
  console.log(`PIB: ${items.length} items, ${chunksWritten} chunks`);
} else {
  console.log("Ingest: skipping PIB (INGEST_SKIP_PIB=1)");
  const fixtureUrl = "https://www.india.gov.in/";
  const sid = await upsertSource(fixtureUrl, "National Portal", "link + short summary", "fixture");
  await ingestDocument(sid, "National Portal fixture", "Passport services and government schemes are listed on the National Portal of India.");
  console.log("Ingest: wrote CI fixture chunk for", fixtureUrl);
}

const extra = (process.env.INGEST_URLS ?? "").split(",").map((u) => u.trim()).filter(Boolean);
for (const pageUrl of extra) {
  try {
    const page = await ingestPoliteFetch(pageUrl);
    if (page.status >= 400) {
      console.warn("skip", pageUrl, page.status);
      continue;
    }
    const sid = await upsertSource(pageUrl, "official site", "link-only; short summary", page.hash);
    const summary = htmlToSummary(page.text, 600);
    const n = await ingestDocument(sid, pageUrl, summary);
    console.log("ingested", pageUrl, n, "chunks");
  } catch (err) {
    console.warn("failed", pageUrl, err);
  }
}

await client.end({ timeout: 5 });
console.log("Ingest complete");
