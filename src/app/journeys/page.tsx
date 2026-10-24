import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Route } from "lucide-react";
import { journeys } from "@/data/journeys";

export const metadata: Metadata = {
  title: "Life-event guides",
  description: "Step-by-step plans that span several government agencies, in the right order, with official links.",
};

export default function JourneysPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-saffron">Life events</p>
      <h1 className="mt-2 text-4xl font-semibold text-primary">One plan for things that touch many offices</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Changing your name, losing a document or moving house means dealing with several agencies, in a sensible order.
        Each guide lists the steps, what depends on what, the documents to gather, and the official link for every step.
      </p>
      <ul className="mt-8 grid gap-5 md:grid-cols-2">
        {journeys.map((j) => (
          <li key={j.slug}>
            <Link href={`/journeys/${j.slug}`} className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="grid size-10 place-items-center rounded-lg bg-secondary text-primary"><Route className="size-5" aria-hidden /></span>
              <h2 className="mt-4 text-2xl font-semibold">{j.title}</h2>
              <p className="mt-2 flex-1 text-muted-foreground">{j.tagline}</p>
              <p className="mt-4 text-sm font-medium text-primary">
                {j.steps.length} steps across {new Set(j.steps.map((s) => s.agency)).size} agencies
                <ArrowRight className="ml-1 inline size-4 transition group-hover:translate-x-1" aria-hidden />
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
