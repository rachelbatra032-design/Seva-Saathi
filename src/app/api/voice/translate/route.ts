import { NextResponse } from "next/server";
import { isSupportedLanguage } from "@/lib/languages";
import { sarvamConfigured, translate, SarvamError } from "@/lib/sarvam/client";
import { mockFromEnglish, mockToEnglish } from "@/lib/sarvam/mock";
import { AUDIO_POLICY_HEADERS } from "@/lib/audio-policy";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { sanitizeUserQuery } from "@/lib/safety/sanitize";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!rateLimit(`translate:${clientKey(req)}`, 40)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: { text?: unknown; from?: unknown; to?: unknown; demo?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON required" }, { status: 400 });
  }

  const cleaned = sanitizeUserQuery(typeof body.text === "string" ? body.text : "");
  if (!cleaned.ok) return NextResponse.json({ error: "Invalid text" }, { status: 400 });

  const from = typeof body.from === "string" && isSupportedLanguage(body.from) ? body.from : "en-IN";
  const to = typeof body.to === "string" && isSupportedLanguage(body.to) ? body.to : "hi-IN";
  const demo = body.demo === true;

  if (from === to) {
    return NextResponse.json({ text: cleaned.text, provider: "none" }, { headers: AUDIO_POLICY_HEADERS });
  }

  try {
    if (sarvamConfigured() && !demo) {
      const text = await translate(cleaned.text, from, to);
      return NextResponse.json({ text, provider: "sarvam" }, { headers: AUDIO_POLICY_HEADERS });
    }
    if (demo) {
      if (from === "en-IN") {
        const m = mockFromEnglish(cleaned.text, to);
        return NextResponse.json({ text: m.text, provider: "mock", note: m.translated ? undefined : "partial" }, { headers: AUDIO_POLICY_HEADERS });
      }
      const m = mockToEnglish(cleaned.text);
      if (!m.ok) throw new SarvamError("Demo translation unavailable", 503);
      return NextResponse.json({ text: m.text, provider: "mock" }, { headers: AUDIO_POLICY_HEADERS });
    }
    return NextResponse.json(
      { error: "Translation not configured. Set SARVAM_API_KEY or use demo=1.", code: "not-configured" },
      { status: 503 },
    );
  } catch (err) {
    const status = err instanceof SarvamError ? (err.status === 429 ? 429 : 502) : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Translation failed" }, { status });
  }
}
