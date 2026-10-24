import { journeys } from "@/data/journeys";
import { normalize, tokenize } from "@/lib/text";
import { bm25Search, journeyPassages } from "@/lib/assistant/corpus";
import type { Passage, Plan } from "@/lib/assistant/types";

const MIN_SERVICE_SCORE = 5.5;
const STRONG_SERVICE_SCORE = 9;
const MIN_JOURNEY_SCORE = 6;

const PERSONAL_RECORD = [
  /\b(status|track)\b.*\b(my|application|request)\b/,
  /\bis my\b.*\b(approved|ready|processed|dispatched)\b/,
  /\bwhat('s| is) my\b.*\b(number|balance|pan|aadhaar|uan)\b/,
  /\bmy (pan|aadhaar|uan|epf) (number|balance)\b/,
];

const OUT_OF_SCOPE = [
  /\bignore (all|previous|above) instructions\b/i,
  /\b(legal advice|should i sue|can i win|lawyer recommend)\b/,
  /\b(vote for|which party|election prediction)\b/,
  /\b(stock tip|which stock|crypto|bitcoin)\b/,
  /\b(weather in|cricket score|movie|recipe)\b/,
];

function triggerBoost(query: string, slug: string): number {
  const j = journeys.find((x) => x.slug === slug);
  if (!j) return 0;
  const q = normalize(query);
  let boost = 0;
  for (const t of j.triggers) {
    if (t.includes(" ") && q.includes(normalize(t))) boost += 6;
    else if (!t.includes(" ") && q.split(" ").includes(normalize(t))) boost += 2.5;
  }
  return Math.min(boost, 16);
}

export function plan(query: string): Plan {
  const q = normalize(query);
  const qTokens = tokenize(query);

  if (qTokens.length === 0) {
    return { intent: "refusal", serviceSlugs: [], passages: [], confidence: 0, refusalReason: "no-match" };
  }
  if (OUT_OF_SCOPE.some((r) => r.test(q))) {
    return { intent: "refusal", serviceSlugs: [], passages: [], confidence: 0, refusalReason: "out-of-scope" };
  }

  const hits = bm25Search(query, 10);

  const journeyHits = journeys
    .map((j) => {
      const doc = hits.find((h) => h.id === `journey:${j.slug}`);
      const stepScore = hits
        .filter((h) => h.type === "journey-step" && h.journeySlug === j.slug)
        .reduce((a, h) => a + h.score * 0.35, 0);
      const score = (doc?.score ?? 0) + stepScore + triggerBoost(query, j.slug);
      return { slug: j.slug, score };
    })
    .sort((a, b) => b.score - a.score);

  const topJourney = journeyHits[0];
  const serviceHits = hits.filter((h) => h.type === "service");
  const topService = serviceHits[0];

  if (PERSONAL_RECORD.some((r) => r.test(q))) {
    const pass = serviceHits.slice(0, 1);
    return {
      intent: "refusal",
      serviceSlugs: pass.map((p) => p.serviceSlug!).filter(Boolean),
      passages: pass,
      confidence: 0,
      refusalReason: "personal-record",
    };
  }

  const journeyWins =
    topJourney &&
    topJourney.score >= MIN_JOURNEY_SCORE &&
    topJourney.score >= (topService?.score ?? 0) * 0.85;

  if (journeyWins) {
    const j = journeys.find((x) => x.slug === topJourney.slug)!;
    const passages: Passage[] = journeyPassages(j.slug, topJourney.score);
    const serviceSlugs = [
      ...new Set(j.steps.flatMap((s) => s.serviceSlugs ?? [])),
    ].slice(0, 6);
    return {
      intent: "journey",
      journeySlug: j.slug,
      serviceSlugs,
      passages,
      confidence: Math.min(1, topJourney.score / 16),
    };
  }

  if (topService && topService.score >= MIN_SERVICE_SCORE) {
    const cutoff = topService.score * 0.75;
    const picks = serviceHits.filter((h) => h.score >= cutoff && h.score >= MIN_SERVICE_SCORE).slice(0, 3);
    const strong = topService.score >= STRONG_SERVICE_SCORE;
    return {
      intent: strong ? "services" : "weak",
      serviceSlugs: picks.map((p) => p.serviceSlug!),
      passages: picks,
      confidence: Math.min(1, topService.score / 16),
    };
  }

  const nearest = serviceHits.slice(0, 2);
  return {
    intent: "refusal",
    serviceSlugs: [],
    passages: nearest,
    confidence: 0,
    refusalReason: "no-match",
  };
}
