import { createHash } from "node:crypto";

const DIM = 384;

/** Deterministic pseudo-embedding for local dev when no API key is set. */
export function mockEmbed(text: string): number[] {
  const vec = new Array<number>(DIM).fill(0);
  const hash = createHash("sha256").update(text).digest();
  for (let i = 0; i < DIM; i++) {
    const b = hash[i % hash.length];
    vec[i] = (b / 255) * 2 - 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export async function embedText(text: string): Promise<{ vector: number[]; provider: string }> {
  const key = process.env.EMBEDDING_API_KEY?.trim() || process.env.LLM_API_KEY?.trim();
  const base = process.env.EMBEDDING_BASE_URL?.trim() || process.env.LLM_BASE_URL?.trim();
  const model = process.env.EMBEDDING_MODEL?.trim() || "text-embedding-3-small";

  if (!key || !base) {
    return { vector: mockEmbed(text), provider: "mock-deterministic" };
  }

  const res = await fetch(`${base.replace(/\/$/, "")}/embeddings`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ input: text.slice(0, 8000), model }),
  });
  if (!res.ok) {
    return { vector: mockEmbed(text), provider: "mock-fallback" };
  }
  const json = (await res.json()) as { data?: { embedding: number[] }[] };
  const vector = json.data?.[0]?.embedding;
  if (!vector?.length) return { vector: mockEmbed(text), provider: "mock-fallback" };
  return { vector, provider: model };
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d ? dot / d : 0;
}
