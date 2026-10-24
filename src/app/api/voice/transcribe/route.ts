import { NextResponse } from "next/server";
import { isSupportedLanguage } from "@/lib/languages";
import { sarvamConfigured, SarvamError, transcribe } from "@/lib/sarvam/client";
import { mockTranscribe } from "@/lib/sarvam/mock";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { AUDIO_POLICY_HEADERS } from "@/lib/audio-policy";

export const maxDuration = 60;
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  if (!rateLimit(`stt:${clientKey(req)}`, 15)) {
    return NextResponse.json({ error: "Too many voice requests. Please wait a minute." }, { status: 429 });
  }

  const url = new URL(req.url);
  const demo = url.searchParams.get("demo") === "1";
  const langParam = url.searchParams.get("lang") ?? "";
  const lang = isSupportedLanguage(langParam) ? langParam : "en-IN";

  if (demo) {
    return NextResponse.json({ ...mockTranscribe(lang), provider: "mock" });
  }

  if (!sarvamConfigured()) {
    return NextResponse.json(
      { error: "Voice input needs configuration. Set SARVAM_API_KEY on the server, or use demo mode.", code: "not-configured" },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart audio upload." }, { status: 400 });
  }
  const file = form.get("audio");
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: "No audio was received." }, { status: 400 });
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "That recording is too long. Please keep it under about 30 seconds." }, { status: 413 });
  }

  try {
    const ext = file.type.includes("ogg") ? "ogg" : file.type.includes("mp4") ? "mp4" : "webm";
    const result = await transcribe(file, `question.${ext}`, "unknown");
    if (!result.transcript.trim()) {
      return NextResponse.json({ error: "I could not hear anything in that recording. Please try again closer to the microphone." }, { status: 422 });
    }
    return NextResponse.json(
      { transcript: result.transcript, languageCode: result.languageCode, provider: "sarvam" },
      { headers: AUDIO_POLICY_HEADERS },
    );
  } catch (err) {
    const status = err instanceof SarvamError ? (err.status === 429 ? 429 : 502) : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Transcription failed" }, { status });
  }
}
