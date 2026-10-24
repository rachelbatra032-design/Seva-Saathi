"use client";

import { ArrowRight, Mic, Search, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

const EXAMPLES = [
  "I just got married, how do I change my name?",
  "We had a baby, what registrations do we need?",
  "I lost my Aadhaar card",
  "Moving to another state",
];

export function HeroForms() {
  const { t } = useLanguage();
  return (
    <div className="mt-8 max-w-3xl">
      <form action="/ask" method="get" role="search" aria-label="Ask Seva Saathi" className="rounded-2xl bg-white p-2.5 shadow-xl ring-1 ring-black/5">
        <label htmlFor="hero-ask" className="sr-only">{t.askTitle}</label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Sparkles className="ml-1 hidden size-5 shrink-0 text-saffron sm:ml-2 sm:block" aria-hidden />
          <input
            id="hero-ask"
            name="q"
            type="text"
            required
            autoComplete="off"
            placeholder={t.askPlaceholder}
            className="min-h-14 min-w-0 flex-1 rounded-xl bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted-foreground sm:min-h-12"
          />
          <a href="/ask" aria-label={t.tapToSpeak} className="grid size-11 shrink-0 place-items-center rounded-xl border border-input text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Mic className="size-5" aria-hidden />
          </a>
          <button type="submit" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            {t.askButton} <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </form>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Example questions">
        {EXAMPLES.map((e) => (
          <li key={e}>
            <a href={`/ask?q=${encodeURIComponent(e)}`} className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              {e}
            </a>
          </li>
        ))}
      </ul>

      <form action="/services" method="get" role="search" aria-label="Search the services directory" className="mt-6">
        <label htmlFor="hero-search" className="mb-1.5 block text-sm font-medium text-white/85">Or search the services directory</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input id="hero-search" name="q" type="search" autoComplete="off" placeholder={t.searchPlaceholder} className="h-11 w-full rounded-xl bg-white pl-9 pr-3 text-base text-foreground outline-none ring-1 ring-black/5 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-saffron" />
          </div>
          <button type="submit" className="h-11 rounded-xl border border-white/40 px-4 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Search</button>
        </div>
      </form>
    </div>
  );
}
