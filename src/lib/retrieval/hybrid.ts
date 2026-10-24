import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { plan as filePlan } from "@/lib/assistant/planner";
import type { Passage, Plan } from "@/lib/assistant/types";
import { cosineSimilarity, embedText } from "@/lib/ingest/embed";
import { isOfficialUrl } from "@/lib/official-hosts";

const MAX_DB_CHUNKS = 300;

export async function planWithRetrieval(query: string): Promise<Plan> {
  const base = filePlan(query);
  const db = getDb();
  if (!db) return base;

  try {
    const chunkRows = await db
      .select({
        text: schema.chunks.text,
        embedding: schema.chunks.embedding,
        url: schema.sources.url,
        agency: schema.sources.agency,
      })
      .from(schema.chunks)
      .innerJoin(schema.sources, eq(schema.chunks.sourceId, schema.sources.id))
      .limit(MAX_DB_CHUNKS);

    if (chunkRows.length === 0) return base;

    const { vector } = await embedText(query);
    const scored = chunkRows
      .map((r) => ({
        r,
        score: r.embedding?.length ? cosineSimilarity(vector, r.embedding) : 0,
      }))
      .filter((x) => x.score > 0.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    if (scored.length === 0) return base;

    const extra: Passage[] = [];
    for (let i = 0; i < scored.length; i++) {
      const s = scored[i];
      const url = s.r.url;
      if (!isOfficialUrl(url)) continue;
      let publisher = "gov.in";
      try {
        publisher = new URL(url).hostname;
      } catch {
        /* keep default */
      }
      extra.push({
        id: `db-chunk:${i}`,
        type: "service",
        title: s.r.agency ?? "Official update",
        text: s.r.text,
        score: s.score * 10,
        sources: [
          {
            title: s.r.agency ?? "Official source",
            url,
            publisher,
            snapshot: true,
          },
        ],
      });
    }

    if (extra.length === 0) return base;

    return {
      ...base,
      passages: [...base.passages, ...extra],
      confidence: Math.min(1, base.confidence + scored[0].score * 0.15),
    };
  } catch {
    return base;
  }
}
