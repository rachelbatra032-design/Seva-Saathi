import { customType } from "drizzle-orm/pg-core";

export const EMBEDDING_DIM = 384;

export function formatPgVector(values: number[]): string {
  if (values.length !== EMBEDDING_DIM) {
    throw new Error(`Expected ${EMBEDDING_DIM} dimensions, got ${values.length}`);
  }
  return `[${values.join(",")}]`;
}

export function parsePgVector(raw: unknown): number[] | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) return raw as number[];
  const s = String(raw).trim();
  if (!s.startsWith("[")) return null;
  const inner = s.slice(1, -1);
  if (!inner) return [];
  return inner.split(",").map((x) => Number(x.trim()));
}

export const vector384 = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return `vector(${EMBEDDING_DIM})`;
  },
  toDriver(value) {
    return formatPgVector(value);
  },
  fromDriver(value) {
    return parsePgVector(value) ?? [];
  },
});
