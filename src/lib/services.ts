import { centralServices } from "@/data/services-central";
import { stateServices } from "@/data/services-states";
import { categories, categoryBySlug } from "@/data/categories";
import { stateByCode } from "@/data/states";
import linkStatusJson from "@/data/generated/link-status.json";
import snippetsJson from "@/data/generated/official-snippets.json";
import type { CategorySlug, LinkCheck, OfficialSnippet, Service } from "@/lib/types";
import { queryConcepts, tokenize } from "@/lib/text";

export const allServices: Service[] = [...centralServices, ...stateServices];

const bySlug = new Map(allServices.map((s) => [s.slug, s]));

export const getService = (slug: string) => bySlug.get(slug);

const linkStatus = linkStatusJson as Record<string, LinkCheck>;
const snippets = snippetsJson as Record<string, OfficialSnippet>;

export function getLinkCheck(url: string): LinkCheck {
  return linkStatus[url] ?? { status: "unchecked", checkedAt: "" };
}

export function getSnippet(url: string): OfficialSnippet | undefined {
  return snippets[url];
}

export const POPULAR_SLUGS = [
  "passport-seva",
  "aadhaar-uidai",
  "pan-apply-protean",
  "digilocker",
  "umang",
  "gst-portal",
  "epfo-member-portal",
  "income-tax-efiling",
  "voter-services-portal",
  "parivahan-sarathi",
  "ration-card-nfsa",
  "national-scholarship-portal",
];

export const popularServices = POPULAR_SLUGS.map((s) => bySlug.get(s)).filter(
  (s): s is Service => Boolean(s),
);

export function servicesInCategory(slug: CategorySlug): Service[] {
  return allServices.filter((s) => s.category === slug);
}

export function categoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of allServices) counts[s.category] = (counts[s.category] ?? 0) + 1;
  return counts;
}

export function relatedServices(service: Service, limit = 4): Service[] {
  return allServices
    .filter((s) => s.slug !== service.slug && s.category === service.category && s.level === service.level)
    .slice(0, limit);
}

export const stateLabel = (code?: string) => (code ? (stateByCode[code]?.name ?? code) : undefined);

export { categories, categoryBySlug };

export type ServiceFilters = {
  query: string;
  category: CategorySlug | "all";
  level: "all" | "Central" | "State";
  state: string | "all";
};

type Indexed = { service: Service; fields: { tokens: Set<string>; weight: number }[]; haystack: string };

const index: Indexed[] = allServices.map((service) => {
  const f = (text: string, weight: number) => ({ tokens: new Set(tokenize(text, false)), weight });
  const haystack = [service.title, service.summary, service.ministry, ...(service.tags ?? [])]
    .join(" ")
    .toLowerCase();
  return {
    service,
    haystack,
    fields: [
      f(service.title, 6),
      f((service.tags ?? []).join(" "), 5),
      f(service.ministry, 2),
      f(service.summary, 1.5),
      f(stateLabel(service.state) ?? "", 3),
      f(categoryBySlug[service.category]?.name ?? "", 1),
    ],
  };
});

export function searchServices(filters: ServiceFilters): Service[] {
  const q = filters.query.trim().toLowerCase();
  const concepts = queryConcepts(q);
  const scored: { service: Service; score: number }[] = [];

  for (const item of index) {
    const { service } = item;
    if (filters.category !== "all" && service.category !== filters.category) continue;
    if (filters.level !== "all" && service.level !== filters.level) continue;
    if (filters.state !== "all" && service.state !== filters.state) continue;

    if (!concepts.length) {
      scored.push({ service, score: 0 });
      continue;
    }
    let score = 0;
    let matched = 0;
    for (const group of concepts) {
      let best = 0;
      for (const field of item.fields) {
        for (const t of group) {
          if (field.tokens.has(t)) best = Math.max(best, field.weight);
        }
      }
      if (best > 0) matched++;
      score += best;
    }
    if (matched !== concepts.length) continue;
    if (q.length >= 3 && item.haystack.includes(q)) score += 4;
    if (item.service.title.toLowerCase().startsWith(q)) score += 4;
    scored.push({ service, score: score + matched });
  }

  if (!concepts.length) return scored.map((s) => s.service);
  return scored.sort((a, b) => b.score - a.score).map((s) => s.service);
}
