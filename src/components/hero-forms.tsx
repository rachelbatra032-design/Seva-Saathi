"use client";

import { ArrowRight, Mic } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

const EXAMPLES = [
  "I just got married. How do I change my name?",
  "I lost my Aadhaar card",
  "We're moving to Karnataka",
  "We had a baby—what do we register?",
];

type HeroFormsProps = {
  /** Calm, light hero on the home page (editorial layout). */
  variant?: "default" | "editorial";
};

export function HeroForms({ variant = "default" }: HeroFormsProps) {
  const { t } = useLanguage();
  const editorial = variant === "editorial";

  return (
    <div className={editorial ? "mt-8 max-w-3xl" : "mt-8 max-w-3xl"}>
      <form
        action="/ask"
        method="get"
        role="search"
        aria-label="Ask Seva Saathi"
        className={
          editorial
            ? "rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4"
            : "rounded-2xl bg-white p-2.5 shadow-xl ring-1 ring-black/5"
        }
      >
        <label htmlFor="hero-ask" className="sr-only">{t.askTitle}</label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <input
            id="hero-ask"
            name="q"
            type="text"
            required
            autoComplete="off"
            placeholder={
              editorial
                ? "Type your question in plain language…"
                : t.askPlaceholder
            }
            className={
              editorial
                ? "min-h-[3.25rem] min-w-0 flex-1 rounded-xl border border-input bg-background px-4 text-lg text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary sm:min-h-[3.5rem]"
                : "min-h-14 min-w-0 flex-1 rounded-xl bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted-foreground sm:min-h-12"
            }
          />
          <div className="flex gap-2 sm:shrink-0">
            <a
              href="/ask"
              aria-label={t.tapToSpeak}
              className={
                editorial
                  ? "grid size-12 place-items-center rounded-xl border border-input text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  : "grid size-11 shrink-0 place-items-center rounded-xl border border-input text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              }
            >
              <Mic className="size-5" aria-hidden />
            </a>
            <button
              type="submit"
              className={
                editorial
                  ? "inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-none"
                  : "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              }
            >
              {t.askButton} <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </form>
      <ul
        className={`mt-4 flex flex-wrap gap-2 ${editorial ? "" : ""}`}
        aria-label="Example questions"
      >
        {EXAMPLES.map((e) => (
          <li key={e}>
            <a
              href={`/ask?q=${encodeURIComponent(e)}`}
              className={
                editorial
                  ? "inline-flex rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  : "inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              }
            >
              {e}
            </a>
          </li>
        ))}
      </ul>

      {!editorial && (
        <form action="/services" method="get" role="search" aria-label="Search the services directory" className="mt-6">
          <label htmlFor="hero-search" className="mb-1.5 block text-sm font-medium text-white/85">
            Or search the services directory
          </label>
          <div className="flex gap-2">
            <input
              id="hero-search"
              name="q"
              type="search"
              autoComplete="off"
              placeholder={t.searchPlaceholder}
              className="h-11 min-w-0 flex-1 rounded-xl bg-white pl-3 pr-3 text-base text-foreground outline-none ring-1 ring-black/5 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-saffron"
            />
            <button
              type="submit"
              className="h-11 shrink-0 rounded-xl border border-white/40 px-4 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Search
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
