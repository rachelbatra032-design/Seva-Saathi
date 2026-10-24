import type { AssistantProvider, GenerateInput, GenerateOutput } from "@/lib/assistant/types";

const SYSTEM_PROMPT = `You are the answering step of India.Gov, an unofficial aggregator of Indian government information.
Rules you must follow:
1. Use ONLY the numbered passages provided. Do not use any other knowledge about Indian government rules, fees, deadlines or links.
2. Every factual sentence must end with one or more citation markers like [2] that refer to passage numbers.
3. If the passages do not answer the question, set "supported" to false and leave "text" empty. Never guess.
4. Never ask for or repeat personal identifiers such as Aadhaar, PAN or OTP.
5. Write plain, friendly English in short paragraphs or numbered steps. Do not add links; the application attaches official links itself.
Respond with a single JSON object: {"text": string, "used": number[], "supported": boolean}.`;

function config() {
  const key = process.env.LLM_API_KEY;
  if (!key) return null;
  return {
    key,
    base: (process.env.LLM_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, ""),
    model: process.env.LLM_MODEL ?? "gpt-4o-mini",
  };
}

export const llmConfigured = () => config() !== null;

export const llmProvider: AssistantProvider = {
  name: `OpenAI-compatible LLM (${process.env.LLM_MODEL ?? "gpt-4o-mini"})`,
  async generate({ query, plan }: GenerateInput): Promise<GenerateOutput> {
    const cfg = config();
    if (!cfg) throw new Error("LLM_API_KEY is not set");

    const passages = plan.passages
      .map((p, i) => `[${i + 1}] ${p.title}\n${p.text.slice(0, 900)}\nSource: ${p.sources[0]?.url ?? "n/a"}`)
      .join("\n\n");

    const res = await fetch(`${cfg.base}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${cfg.key}` },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Question: ${query}\n\nPassages:\n${passages}` },
        ],
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) throw new Error(`LLM request failed with HTTP ${res.status}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("LLM returned no content");
    const parsed = JSON.parse(content) as Partial<GenerateOutput>;
    return {
      text: typeof parsed.text === "string" ? parsed.text : "",
      used: Array.isArray(parsed.used) ? parsed.used.filter((n): n is number => Number.isInteger(n)) : [],
      supported: parsed.supported === true,
    };
  },
};
