import { getSql } from "@/db/client";
import { formatPgVector } from "@/db/vector";

export type VectorHit = {
  text: string;
  url: string;
  agency: string | null;
  score: number;
};

/** Cosine similarity search via pgvector (`<=>` with vector_cosine_ops). */
export async function searchChunksByCosine(queryVector: number[], limit = 6): Promise<VectorHit[]> {
  const sql = getSql();
  if (!sql) return [];

  const vec = formatPgVector(queryVector);
  const rows = await sql<
    { text: string; url: string; agency: string | null; score: number }[]
  >`
    SELECT
      c.text,
      s.url,
      s.agency,
      (1 - (c.embedding <=> ${vec}::vector))::float AS score
    FROM chunks c
    INNER JOIN sources s ON c.source_id = s.id
    WHERE c.embedding IS NOT NULL
    ORDER BY c.embedding <=> ${vec}::vector
    LIMIT ${limit}
  `;

  return rows.map((r) => ({
    text: r.text,
    url: r.url,
    agency: r.agency,
    score: Number(r.score),
  }));
}
