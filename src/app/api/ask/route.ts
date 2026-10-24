import { NextResponse } from "next/server";
import { answerQuery, providerStatus } from "@/lib/assistant/answer";
import { isSupportedLanguage } from "@/lib/languages";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { sanitizeUserQuery } from "@/lib/safety/sanitize";
import { hashClientKey, logApiEvent } from "@/lib/safety/logging";

export const maxDuration = 60;

type Body = { question?: unknown; message?: unknown; lang?: unknown };

export async function POST(req: Request) {
  const ck = hashClientKey(clientKey(req));
  if (!rateLimit(`ask:${clientKey(req)}`, 30)) {
    logApiEvent({ route: "/api/ask", outcome: "rate_limited", clientHash: ck });
    return NextResponse.json({ refused: true, error: "Too many requests. Please wait a minute." }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ refused: true, error: "JSON body required" }, { status: 400 });
  }

  const raw = typeof body.question === "string" ? body.question : typeof body.message === "string" ? body.message : "";
  const cleaned = sanitizeUserQuery(raw);
  if (!cleaned.ok) {
    return NextResponse.json({ refused: true, error: "Please enter a valid question." }, { status: 400 });
  }

  const lang = typeof body.lang === "string" && isSupportedLanguage(body.lang) ? body.lang : "en-IN";
  const reply = await answerQuery(cleaned.text, lang);

  const refused = reply.intent === "refusal" || !reply.grounded;
  const confidence = refused ? 0 : Math.min(1, 0.5 + reply.citations.length * 0.1);

  logApiEvent({ route: "/api/ask", outcome: refused ? "refused" : "ok", clientHash: ck });

  return NextResponse.json({
    answer: reply.text,
    steps: reply.journeySlug ? [] : undefined,
    citations: reply.citations.map((c) => ({
      n: c.n,
      title: c.title,
      url: c.url,
      publisher: c.publisher,
    })),
    confidence,
    refused,
    reply,
    assistant: providerStatus(),
  });
}
