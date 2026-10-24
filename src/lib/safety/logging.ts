import { createHash } from "node:crypto";

export function hashClientKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

export function logApiEvent(event: {
  route: string;
  outcome: "ok" | "refused" | "error" | "rate_limited";
  clientHash?: string;
  code?: string;
}) {
  if (process.env.LOG_API_EVENTS !== "1") return;
  console.info(
    JSON.stringify({
      ts: new Date().toISOString(),
      service: "seva-saathi-api",
      ...event,
    }),
  );
}
