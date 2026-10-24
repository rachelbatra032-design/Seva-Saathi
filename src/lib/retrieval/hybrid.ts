import { getDb } from "@/db/client";
import { plan as filePlan } from "@/lib/assistant/planner";
import type { Passage, Plan } from "@/lib/assistant/types";
import { embedText } from "@/lib/ingest/embed";
import { isOfficialUrl } from "@/lib/official-hosts";
import { searchChunksByCosine } from "@/lib/retrieval/vector-search";

export async function planWithRetrieval(query: string): Promise<Plan> {
  const base = filePlan(query);
  const db = getDb();
  if (!db) return base;

  try {
    const { vector } = await embedText(query);
    const scored = (await searchChunksByCosine(vector, 6)).filter((s) => s.score > 0.05);

    if (scored.length === 0) return base;

    const extra: Passage[] = [];
    for (let i = 0; i < scored.length; i++) {
      const s = scored[i];
      const url = s.url;
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
        title: s.agency ?? "Official update",
        text: s.text,
        score: s.score * 10,
        sources: [
          {
            title: s.agency ?? "Official source",
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
