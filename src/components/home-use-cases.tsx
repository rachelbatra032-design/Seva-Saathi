import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { journeys } from "@/data/journeys";

/** Editorial “use case” copy in the visitor’s voice — paired with journey slugs. */
const USE_CASE_COPY: Record<
  string,
  { voice: string; outcome: string }
> = {
  "name-change-after-marriage": {
    voice: "I just got married. How do I change my name?",
    outcome: "See the order for marriage records, Aadhaar, PAN, passport, bank, and more.",
  },
  "lost-aadhaar-or-pan": {
    voice: "I lost my Aadhaar card or PAN.",
    outcome: "Find how to get a replacement or reprint from the official portals.",
  },
  "moving-to-another-state": {
    voice: "I'm moving to another state.",
    outcome: "Plan ration card, voter ID, driving licence, and address updates together.",
  },
  "register-birth-of-child": {
    voice: "We had a baby—what registrations do we need?",
    outcome: "Birth certificate, Aadhaar for your child, and other first steps in one guide.",
  },
  "starting-first-job": {
    voice: "I'm starting my first job.",
    outcome: "PAN, bank account, EPFO/UAN, and tax basics without jumping between sites.",
  },
  "bereavement-death-certificate": {
    voice: "A family member passed away.",
    outcome: "Death certificate, pensions, accounts, and property steps with sensitivity and sources.",
  },
};

export function HomeUseCases() {
  return (
    <section aria-labelledby="use-cases" className="border-b border-border bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-20 md:max-w-4xl md:px-6 lg:max-w-5xl">
        <h2 id="use-cases" className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
          Use cases
        </h2>
        <p className="mt-2 max-w-xl text-base text-muted-foreground">
          Start with a situation that sounds like yours. Each guide is a step-by-step plan across departments.
        </p>
        <ul className="mt-12 space-y-6 sm:mt-14 sm:space-y-8">
          {journeys.map((j) => {
            const copy = USE_CASE_COPY[j.slug] ?? {
              voice: j.title,
              outcome: j.tagline,
            };
            return (
              <li key={j.slug}>
                <Link
                  href={`/journeys/${j.slug}`}
                  className="group block rounded-2xl border border-border bg-card px-6 py-8 transition hover:border-primary/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-8 sm:py-10"
                >
                  <p className="text-lg font-medium leading-snug text-foreground sm:text-xl">{copy.voice}</p>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">{copy.outcome}</p>
                  <p className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Open the guide
                    <ArrowRight
                      className="size-4 transition group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
