import { journeys } from "@/data/journeys";
import { allServices, getSnippet, stateLabel } from "@/lib/services";
import { categoryBySlug } from "@/data/categories";
import { isOfficialUrl, publisherFromUrl } from "@/lib/official-hosts";
import { tokenize } from "@/lib/text";
import type { Passage } from "@/lib/assistant/types";

export type CorpusDoc = Omit<Passage, "score"> & {
  tokens: string[];
  length: number;
  /** Extra weight applied to title tokens at index time. */
  titleTokens: Set<string>;
};

function build(): CorpusDoc[] {
  const docs: CorpusDoc[] = [];

  for (const j of journeys) {
    const text = [j.title, j.tagline, j.audience, j.triggers.join(" "), j.steps.map((s) => s.title).join(" ")].join(" ");
    const titleTokens = new Set(tokenize([j.title, j.triggers.join(" ")].join(" ")));
    docs.push({
      id: `journey:${j.slug}`,
      type: "journey",
      title: j.title,
      text: `${j.tagline} ${j.audience}`,
      sources: [],
      journeySlug: j.slug,
      tokens: [...tokenize(text), ...tokenize(j.triggers.join(" "))],
      titleTokens,
      length: 0,
    });

    for (const st of j.steps) {
      const stepText = [st.title, st.agency, st.summary, st.howTo.join(" "), st.documents.join(" ")].join(" ");
      docs.push({
        id: `step:${j.slug}:${st.id}`,
        type: "journey-step",
        title: st.title,
        text: `${st.summary} ${st.howTo.join(" ")}`,
        sources: st.links
          .filter((l) => isOfficialUrl(l.url))
          .map((l) => ({ title: l.label, url: l.url, publisher: publisherFromUrl(l.url) })),
        journeySlug: j.slug,
        tokens: tokenize(stepText),
        titleTokens: new Set(tokenize(`${st.title} ${st.agency}`)),
        length: 0,
      });
    }
  }

  for (const s of allServices) {
    const snap = getSnippet(s.url);
    const snapText = snap ? [snap.title, snap.description, ...(snap.headings ?? [])].filter(Boolean).join(" ") : "";
    const text = [
      s.title,
      s.summary,
      s.ministry,
      (s.tags ?? []).join(" "),
      categoryBySlug[s.category]?.name ?? "",
      stateLabel(s.state) ?? "",
      s.whoFor ?? "",
      (s.howToApply ?? []).join(" "),
      snapText,
    ].join(" ");
    docs.push({
      id: `service:${s.slug}`,
      type: "service",
      title: s.title,
      text: `${s.summary} ${s.whoFor ?? ""}`,
      sources: isOfficialUrl(s.url)
        ? [{ title: s.title, url: s.url, publisher: publisherFromUrl(s.url), snapshot: Boolean(snap) }]
        : [],
      serviceSlug: s.slug,
      tokens: tokenize(text),
      titleTokens: new Set(tokenize(`${s.title} ${(s.tags ?? []).join(" ")}`)),
      length: 0,
    });
  }

  for (const d of docs) d.length = d.tokens.length;
  return docs;
}

export const corpus: CorpusDoc[] = build();

const df = new Map<string, number>();
for (const d of corpus) for (const t of new Set(d.tokens)) df.set(t, (df.get(t) ?? 0) + 1);
const avgLen = corpus.reduce((a, d) => a + d.length, 0) / corpus.length;

const K1 = 1.4;
const B = 0.6;

export function bm25Search(query: string, limit = 8): Passage[] {
  const qTokens = [...new Set(tokenize(query))];
  if (!qTokens.length) return [];
  const N = corpus.length;
  const scored: Passage[] = [];

  for (const d of corpus) {
    const tf = new Map<string, number>();
    for (const t of d.tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    let score = 0;
    for (const q of qTokens) {
      const f = tf.get(q);
      if (!f) continue;
      const idf = Math.log(1 + (N - (df.get(q) ?? 0) + 0.5) / ((df.get(q) ?? 0) + 0.5));
      score += idf * ((f * (K1 + 1)) / (f + K1 * (1 - B + B * (d.length / avgLen))));
      if (d.titleTokens.has(q)) score += idf * 0.8;
    }
    if (score > 0) {
      const { tokens: _t, titleTokens: _tt, length: _l, ...rest } = d;
      void _t; void _tt; void _l;
      scored.push({ ...rest, score });
    }
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

const byId = new Map(corpus.map((d) => [d.id, d]));

function toPassage(d: CorpusDoc, score = 0): Passage {
  const { tokens: _t, titleTokens: _tt, length: _l, ...rest } = d;
  void _t; void _tt; void _l;
  return { ...rest, score };
}

/** The journey overview followed by every step, in order. */
export function journeyPassages(slug: string, score = 0): Passage[] {
  const out: Passage[] = [];
  const head = byId.get(`journey:${slug}`);
  if (head) out.push(toPassage(head, score));
  for (const d of corpus) {
    if (d.type === "journey-step" && d.journeySlug === slug) out.push(toPassage(d, score));
  }
  return out;
}

export function servicePassage(slug: string, score = 0): Passage | undefined {
  const d = byId.get(`service:${slug}`);
  return d ? toPassage(d, score) : undefined;
}
