import { randomUUID } from "node:crypto";
import { plan as makePlan } from "@/lib/assistant/planner";
import { mockProvider } from "@/lib/assistant/mock-provider";
import { llmProvider, llmConfigured } from "@/lib/assistant/llm-provider";
import { isOfficialUrl } from "@/lib/official-hosts";
import { journeyBySlug } from "@/data/journeys";
import type { AssistantProvider, AssistantReply, Citation, Plan } from "@/lib/assistant/types";

const NATIONAL_PORTAL = {
  title: "National Portal of India",
  url: "https://www.india.gov.in/",
  publisher: "india.gov.in",
};

export function selectedProvider(): AssistantProvider {
  const wanted = (process.env.ASSISTANT_PROVIDER ?? "mock").toLowerCase();
  if ((wanted === "openai-compatible" || wanted === "openai" || wanted === "llm") && llmConfigured()) {
    return llmProvider;
  }
  return mockProvider;
}

export function providerStatus() {
  const wanted = (process.env.ASSISTANT_PROVIDER ?? "mock").toLowerCase();
  const p = selectedProvider();
  return { requested: wanted, active: p.name, llm: p === llmProvider };
}

function refusalText(plan: Plan): string {
  switch (plan.refusalReason) {
    case "personal-record":
      return "I cannot see anyone's personal records, application status, or ID numbers, and you should not share them in a chat. You can check this yourself on the official site, which is linked below.";
    case "out-of-scope":
      return "That is outside what India.Gov can answer from official sources, so I will not guess. For government information, the National Portal of India is the best starting point.";
    case "translation-unavailable":
      return "I could not translate your message because voice and translation are not configured on this server. Please type your question in English, or ask the site owner to set up the Sarvam API key.";
    default:
      return "I do not have a reliable official source for that in my directory, so I will not guess. The National Portal of India lists every ministry and department and is a good place to start. You can also browse the services directory on this site.";
  }
}

function followUpsFor(plan: Plan): string[] {
  if (plan.intent === "journey" && plan.journeySlug) {
    return ["Which documents do I need?", "Do I need a Gazette notification?", "What can I do online?"];
  }
  if (plan.intent === "services" || plan.intent === "weak") {
    return ["How do I apply?", "What documents are needed?"];
  }
  return ["I just got married, how do I change my name?", "I lost my Aadhaar card", "I am moving to another state"];
}

export async function answerQuery(query: string, language = "en-IN"): Promise<AssistantReply> {
  const plan = makePlan(query);
  const id = randomUUID();
  const base = { id, language, followUps: followUpsFor(plan), serviceSlugs: plan.serviceSlugs };

  if (plan.intent === "refusal") {
    const citations: Citation[] = [];
    const add = (c: Omit<Citation, "n">) => {
      if (isOfficialUrl(c.url) && !citations.some((x) => x.url === c.url)) citations.push({ ...c, n: citations.length + 1, kind: c.kind });
    };
    for (const p of plan.passages) for (const s of p.sources) add({ title: s.title, url: s.url, publisher: s.publisher, kind: s.snapshot ? "snapshot" : "page" });
    add({ ...NATIONAL_PORTAL, kind: "page" });
    return {
      ...base,
      intent: "refusal",
      text: refusalText(plan),
      citations,
      grounded: false,
      provider: "policy: refuse when unsupported",
    };
  }

  let provider = selectedProvider();
  let note: string | undefined;
  let output = await provider.generate({ query, plan }).catch((err: unknown) => {
    note = err instanceof Error ? err.message : "provider error";
    return null;
  });

  const valid = (o: typeof output) =>
    !!o &&
    o.supported &&
    o.text.trim().length > 0 &&
    o.used.length > 0 &&
    o.used.every((n) => n >= 1 && n <= plan.passages.length) &&
    /\[\d+\]/.test(o.text);

  if (!valid(output) && provider !== mockProvider) {
    provider = mockProvider;
    output = await mockProvider.generate({ query, plan });
    note = note ? `${note}; used built-in matcher instead` : "LLM answer was not grounded; used built-in matcher instead";
  }

  if (!output || !valid(output)) {
    return {
      ...base,
      intent: "refusal",
      text: refusalText({ ...plan, refusalReason: "no-match" }),
      citations: [{ ...NATIONAL_PORTAL, n: 1, kind: "page" }],
      grounded: false,
      provider: provider.name,
    };
  }

  const citations: Citation[] = [];
  const markerFor = new Map<number, number>();
  const addCitation = (src: { title: string; url: string; publisher: string; snapshot?: boolean }) => {
    if (!isOfficialUrl(src.url)) return undefined;
    const existing = citations.find((c) => c.url === src.url);
    if (existing) return existing.n;
    const n = citations.length + 1;
    citations.push({ n, title: src.title, url: src.url, publisher: src.publisher, kind: src.snapshot ? "snapshot" : "page" });
    return n;
  };

  for (const idx of [...new Set(output.used)].sort((a, b) => a - b)) {
    const passage = plan.passages[idx - 1];
    let first: number | undefined;
    for (const src of passage.sources) {
      const n = addCitation(src);
      first ??= n;
    }
    if (first) markerFor.set(idx, first);
  }

  const text = output.text.replace(/\[(\d+)\]/g, (_, d: string) => {
    const mapped = markerFor.get(Number(d));
    return mapped ? `[${mapped}]` : "";
  });

  if (citations.length === 0) {
    return {
      ...base,
      intent: "refusal",
      text: refusalText({ ...plan, refusalReason: "no-match" }),
      citations: [{ ...NATIONAL_PORTAL, n: 1, kind: "page" }],
      grounded: false,
      provider: provider.name,
    };
  }

  const journey = plan.journeySlug ? journeyBySlug[plan.journeySlug] : undefined;
  return {
    ...base,
    intent: plan.intent,
    text: text.replace(/ +\n/g, "\n").trim(),
    journeySlug: journey?.slug,
    citations,
    grounded: true,
    provider: note ? `${provider.name} (${note})` : provider.name,
  };
}
