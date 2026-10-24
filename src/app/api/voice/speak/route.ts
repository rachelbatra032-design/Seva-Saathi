import { NextResponse } from "next/server";
import { LANGUAGES, isSupportedLanguage, languageByCode } from "@/lib/languages";
import { sarvamConfigured, SarvamError, synthesize } from "@/lib/sarvam/client";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!rateLimit(`tts:${clientKey(req)}`, 15)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }
  let body: { text?: unknown; lang?: unknown; demo?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.replace(/\[\d+\]/g, "").trim() : "";
  const lang = typeof body.lang === "string" && isSupportedLanguage(body.lang) ? body.lang : "en-IN";
  if (!text) return NextResponse.json({ error: "Nothing to read aloud." }, { status: 400 });

  if (!languageByCode[lang]?.tts) {
    const supported = LANGUAGES.filter((l) => l.tts).map((l) => l.name).join(", ");
    return NextResponse.json(
      { error: `Read-aloud is not available in ${languageByCode[lang]?.name ?? lang} yet. Supported: ${supported}.`, code: "unsupported-language" },
      { status: 422 },
    );
  }

  if (body.demo === true) return NextResponse.json({ mock: true, provider: "mock" });

  if (!sarvamConfigured()) {
    return NextResponse.json(
      { error: "Read-aloud needs configuration. Set SARVAM_API_KEY on the server, or use demo mode.", code: "not-configured" },
      { status: 503 },
    );
  }

  try {
    const audio = await synthesize(text, lang);
    return NextResponse.json({ audioBase64: audio, mime: "audio/wav", provider: "sarvam" });
  } catch (err) {
    const status = err instanceof SarvamError && err.status === 429 ? 429 : 502;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Speech synthesis failed" }, { status });
  }
}
