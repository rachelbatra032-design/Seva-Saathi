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
      <form action="/ask" method="get" role="search" aria-label="Ask Seva Saathi" className="rounded-md border border-border bg-card p-2.5 shadow-sm">
        <label htmlFor="hero-ask" className="sr-only">{t.askTitle}</label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Sparkles className="ml-1 hidden size-5 shrink-0 text-primary sm:ml-2 sm:block" aria-hidden />
          <input
            id="hero-ask"
            name="q"
            type="text"
            required
            autoComplete="off"
            placeholder={t.askPlaceholder}
            className="min-h-14 min-w-0 flex-1 rounded-md bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted-foreground sm:min-h-12"
          />
          <a href="/ask" aria-label={t.tapToSpeak} className="grid size-11 shrink-0 place-items-center rounded-md border border-input text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Mic className="size-5" aria-hidden />
          </a>
          <button type="submit" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-[#0b5ed7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            {t.askButton} <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </form>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Example questions">
        {EXAMPLES.map((e) => (
          <li key={e}>
            <a href={`/ask?q=${encodeURIComponent(e)}`} className="inline-flex rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {e}
            </a>
          </li>
        ))}
      </ul>

      <form action="/services" method="get" role="search" aria-label="Search the services directory" className="mt-6">
        <label htmlFor="hero-search" className="mb-1.5 block text-sm font-medium text-foreground">Or search the services directory</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input id="hero-search" name="q" type="search" autoComplete="off" placeholder={t.searchPlaceholder} className="h-11 w-full rounded-md border border-input bg-card pl-9 pr-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <button type="submit" className="h-11 rounded-md border border-primary bg-card px-4 text-sm font-semibold text-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Search</button>
        </div>
      </form>
    </div>
  );
}
