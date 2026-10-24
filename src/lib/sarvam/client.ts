import "server-only";

const BASE = (process.env.SARVAM_BASE_URL ?? "https://api.sarvam.ai").replace(/\/$/, "");

export const SARVAM_STT_MODEL = process.env.SARVAM_STT_MODEL ?? "saaras:v4";
export const SARVAM_TRANSLATE_MODEL = process.env.SARVAM_TRANSLATE_MODEL ?? "sarvam-translate:v1";
export const SARVAM_TTS_MODEL = process.env.SARVAM_TTS_MODEL ?? "bulbul:v3";
export const SARVAM_TTS_SPEAKER = process.env.SARVAM_TTS_SPEAKER ?? "shubh";

export class SarvamError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export const sarvamConfigured = () => Boolean(process.env.SARVAM_API_KEY);

function key(): string {
  const k = process.env.SARVAM_API_KEY;
  if (!k) throw new SarvamError("SARVAM_API_KEY is not configured", 503);
  return k;
}

async function failure(res: Response): Promise<SarvamError> {
  let detail = "";
  try {
    const body = (await res.json()) as { error?: { message?: string }; message?: string };
    detail = body.error?.message ?? body.message ?? "";
  } catch {
    /* body was not JSON */
  }
  const msg =
    res.status === 403 || res.status === 401
      ? "Sarvam rejected the API key"
      : res.status === 429
        ? "Sarvam rate limit reached, please try again shortly"
        : `Sarvam request failed (HTTP ${res.status})`;
  return new SarvamError(detail ? `${msg}: ${detail}` : msg, res.status);
}

/** Speech to text. Pass languageCode "unknown" to let Sarvam detect the language. */
export async function transcribe(
  audio: Blob,
  filename: string,
  languageCode: string,
): Promise<{ transcript: string; languageCode: string | null }> {
  const form = new FormData();
  form.append("file", audio, filename);
  form.append("model", SARVAM_STT_MODEL);
  form.append("language_code", languageCode);
  const res = await fetch(`${BASE}/speech-to-text`, {
    method: "POST",
    headers: { "api-subscription-key": key() },
    body: form,
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw await failure(res);
  const json = (await res.json()) as { transcript?: string; language_code?: string | null };
  return { transcript: json.transcript ?? "", languageCode: json.language_code ?? null };
}

const MAX_TRANSLATE_CHARS = 900;

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let current = "";
  for (const line of text.split("\n")) {
    if ((current + "\n" + line).length > MAX_TRANSLATE_CHARS && current) {
      chunks.push(current);
      current = line;
    } else {
      current = current ? `${current}\n${line}` : line;
    }
  }
  if (current) chunks.push(current);
  return chunks.flatMap((c) =>
    c.length <= MAX_TRANSLATE_CHARS ? [c] : (c.match(new RegExp(`.{1,${MAX_TRANSLATE_CHARS}}`, "gs")) ?? [c]),
  );
}

async function translateChunk(input: string, source: string, target: string): Promise<string> {
  if (!input.trim()) return input;
  const res = await fetch(`${BASE}/translate`, {
    method: "POST",
    headers: { "api-subscription-key": key(), "content-type": "application/json" },
    body: JSON.stringify({
      input,
      source_language_code: source,
      target_language_code: target,
      model: SARVAM_TRANSLATE_MODEL,
      mode: "formal",
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw await failure(res);
  const json = (await res.json()) as { translated_text?: string };
  return json.translated_text ?? input;
}

export async function translate(text: string, source: string, target: string): Promise<string> {
  if (source === target) return text;
  const parts: string[] = [];
  for (const chunk of chunkText(text)) parts.push(await translateChunk(chunk, source, target));
  return parts.join("\n");
}

/** Text to speech. Returns a base64-encoded WAV. */
export async function synthesize(text: string, languageCode: string): Promise<string> {
  const res = await fetch(`${BASE}/text-to-speech`, {
    method: "POST",
    headers: { "api-subscription-key": key(), "content-type": "application/json" },
    body: JSON.stringify({
      text: text.slice(0, 2400),
      target_language_code: languageCode,
      model: SARVAM_TTS_MODEL,
      speaker: SARVAM_TTS_SPEAKER,
    }),
    signal: AbortSignal.timeout(40000),
  });
  if (!res.ok) throw await failure(res);
  const json = (await res.json()) as { audios?: string[] };
  const audio = json.audios?.[0];
  if (!audio) throw new SarvamError("Sarvam returned no audio", 502);
  return audio;
}
