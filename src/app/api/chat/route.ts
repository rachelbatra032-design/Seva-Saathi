import { NextResponse } from "next/server";
import { answerQuery, providerStatus } from "@/lib/assistant/answer";
import { isSupportedLanguage } from "@/lib/languages";
import { detectIndicLanguage } from "@/lib/script";
import { sarvamConfigured, translate, SarvamError } from "@/lib/sarvam/client";
import { mockFromEnglish, mockToEnglish } from "@/lib/sarvam/mock";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import type { AssistantReply } from "@/lib/assistant/types";

export const maxDuration = 60;

type Body = { message?: unknown; lang?: unknown; inputLang?: unknown; demo?: unknown };

export async function POST(req: Request) {
  if (!rateLimit(`chat:${clientKey(req)}`, 30)) {
    return NextResponse.json({ error: "Too many questions in a short time. Please wait a minute and try again." }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ error: "Please type or speak a question." }, { status: 400 });
  if (message.length > 600) return NextResponse.json({ error: "Please keep your question under 600 characters." }, { status: 400 });

  const uiLang = typeof body.lang === "string" && isSupportedLanguage(body.lang) ? body.lang : "en-IN";
  const spoken = typeof body.inputLang === "string" && isSupportedLanguage(body.inputLang) ? body.inputLang : null;
  const demo = body.demo === true;
  const useSarvam = sarvamConfigured() && !demo;

  const sourceLang = spoken ?? detectIndicLanguage(message, uiLang) ?? "en-IN";
  const notes: string[] = [];
  let englishQuery = message;

  try {
    if (sourceLang !== "en-IN") {
      if (useSarvam) {
        englishQuery = await translate(message, sourceLang, "en-IN");
      } else if (demo) {
        const m = mockToEnglish(message);
        if (!m.ok) throw new SarvamError("Demo translation could not read this message", 503);
        englishQuery = m.text;
        notes.push("Demo mode: your message was matched with a small built-in glossary, not a translation service.");
      } else {
        throw new SarvamError("Translation is not configured", 503);
      }
    }
  } catch (err) {
    const reply: AssistantReply = {
      id: crypto.randomUUID(),
      intent: "refusal",
      text:
        err instanceof SarvamError && err.status !== 503
          ? `I could not translate your message just now (${err.message}). Please try again, or type your question in English.`
          : "I could not translate your message because voice and translation are not configured on this server. Please type your question in English, or ask the site owner to set up the Sarvam API key.",
      serviceSlugs: [],
      citations: [{ n: 1, title: "National Portal of India", url: "https://www.india.gov.in/", publisher: "india.gov.in", kind: "page" }],
      grounded: false,
      provider: "policy: refuse when unsupported",
      language: "en-IN",
      followUps: [],
    };
    return NextResponse.json({ reply, englishQuery: null, notes });
  }

  const reply = await answerQuery(englishQuery, uiLang);

  if (uiLang !== "en-IN") {
    try {
      if (useSarvam) {
        reply.text = await translate(reply.text, "en-IN", uiLang);
        reply.translation = { from: "en-IN", to: uiLang, provider: "sarvam" };
      } else if (demo) {
        const m = mockFromEnglish(reply.text, uiLang);
        reply.text = m.text;
        reply.translation = {
          from: "en-IN",
          to: uiLang,
          provider: "mock",
          note: m.translated
            ? "Demo mode: only fixed sentences are pre-translated; the rest stays in English."
            : "Demo mode: no sample translation for this language, so the answer is shown in English.",
        };
      } else {
        reply.translation = {
          from: "en-IN",
          to: uiLang,
          provider: "none",
          note: "Translation needs SARVAM_API_KEY; showing the answer in English.",
        };
      }
    } catch (err) {
      reply.translation = {
        from: "en-IN",
        to: uiLang,
        provider: "none",
        note: `Translation failed (${err instanceof Error ? err.message : "unknown error"}); showing English.`,
      };
    }
  }
  reply.language = reply.translation?.provider === "sarvam" || reply.translation?.provider === "mock" ? uiLang : "en-IN";

  return NextResponse.json({
    reply,
    englishQuery: sourceLang !== "en-IN" ? englishQuery : null,
    sourceLanguage: sourceLang,
    notes,
    assistant: providerStatus(),
  });
}
