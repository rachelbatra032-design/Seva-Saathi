import { connection, NextResponse } from "next/server";
import { sarvamConfigured, SARVAM_STT_MODEL, SARVAM_TRANSLATE_MODEL, SARVAM_TTS_MODEL } from "@/lib/sarvam/client";
import { providerStatus } from "@/lib/assistant/answer";

export async function GET() {
  await connection();
  const configured = sarvamConfigured();
  return NextResponse.json({
    sarvamConfigured: configured,
    demoAvailable: true,
    models: configured
      ? { stt: SARVAM_STT_MODEL, translate: SARVAM_TRANSLATE_MODEL, tts: SARVAM_TTS_MODEL }
      : null,
    assistant: providerStatus(),
  });
}
