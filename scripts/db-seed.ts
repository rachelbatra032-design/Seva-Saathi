/**
 * Loads reviewed TS data files into Postgres. Safe to re-run (upserts).
 * Usage: DATABASE_URL=... npx tsx scripts/db-seed.ts
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql as dsql } from "drizzle-orm";
import postgres from "postgres";
import { centralServices } from "../src/data/services-central";
import { stateServices } from "../src/data/services-states";
import { journeys } from "../src/data/journeys";
import * as schema from "../src/db/schema";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const linkStatusPath = path.join(root, "src/data/generated/link-status.json");

const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema });

const allServices = [...centralServices, ...stateServices];

await db.delete(schema.journeySteps);
await db.delete(schema.journeys);
await db.delete(schema.services);

for (const s of allServices) {
  const { slug, title, summary, category, level, state, url: serviceUrl, ministry, languages, popular, ...rest } = s;
  await db
    .insert(schema.services)
    .values({
      slug,
      title,
      summary,
      category,
      level,
      state: state ?? null,
      url: serviceUrl,
      ministry,
      languages,
      popular: popular ?? false,
      payload: { ...rest, tags: s.tags, whoFor: s.whoFor, howToApply: s.howToApply, documents: s.documents },
    })
    .onConflictDoUpdate({
      target: schema.services.slug,
      set: {
        title,
        summary,
        category,
        level,
        state: state ?? null,
        url: serviceUrl,
        ministry,
        languages,
        popular: popular ?? false,
        payload: { ...rest },
        updatedAt: new Date(),
      },
    });
}

for (const j of journeys) {
  const { slug, title, tagline, steps, ...rest } = j;
  await db
    .insert(schema.journeys)
    .values({ slug, title, tagline, payload: rest as Record<string, unknown> })
    .onConflictDoUpdate({
      target: schema.journeys.slug,
      set: { title, tagline, payload: rest as Record<string, unknown>, updatedAt: new Date() },
    });

  await db.delete(schema.journeySteps).where(dsql`${schema.journeySteps.journeySlug} = ${slug}`);
  for (let ord = 0; ord < steps.length; ord++) {
    const st = steps[ord];
    await db.insert(schema.journeySteps).values({
      journeySlug: slug,
      stepId: st.id,
      ord,
      title: st.title,
      agency: st.agency,
      payload: st as unknown as Record<string, unknown>,
    });
  }
}

try {
  const linkJson = JSON.parse(await readFile(linkStatusPath, "utf8")) as Record<
    string,
    { status: string; checkedAt: string; httpCode?: number; reason?: string }
  >;
  for (const [linkUrl, check] of Object.entries(linkJson)) {
    await db
      .insert(schema.linkChecks)
      .values({
        url: linkUrl,
        status: check.status,
        checkedAt: new Date(check.checkedAt || Date.now()),
        meta: check,
      })
      .onConflictDoUpdate({
        target: schema.linkChecks.url,
        set: { status: check.status, checkedAt: new Date(check.checkedAt || Date.now()), meta: check },
      });
  }
} catch {
  console.warn("No link-status.json; skipped link_checks seed");
}

console.log(`Seeded ${allServices.length} services, ${journeys.length} journeys`);
await client.end({ timeout: 5 });
