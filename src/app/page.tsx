import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, BookCheck, Languages, Link2, Route } from "lucide-react";
import { categories } from "@/data/categories";
import { journeys } from "@/data/journeys";
import { allServices, categoryCounts, popularServices } from "@/lib/services";
import { HeroForms } from "@/components/hero-forms";
import { QuickServicesGrid } from "@/components/quick-services-grid";
import { ServiceCard } from "@/components/service-card";
import { CategoryIcon } from "@/components/category-icon";
import { UpdatesList, UpdatesSkeleton } from "@/components/updates-list";

export default function HomePage() {
  const counts = categoryCounts();
  const centralCount = allServices.filter((s) => s.level === "Central").length;

  return (
    <>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[28rem] rounded-full border-[28px] border-white/5" />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-12 sm:pt-16">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-saffron-soft">Seva Saathi · unofficial</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-[1.12] sm:text-4xl md:text-5xl">
            What do you need from government today?
          </h1>
          <p className="mt-3 max-w-2xl text-base text-primary-foreground/85 sm:text-lg">
            Ask in plain language first. We answer only from official sources, with links—then help you follow a step-by-step plan.
          </p>
          <HeroForms />
        </div>
      </section>

      <section aria-labelledby="quick-services" className="border-b border-border bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="quick-services" className="text-lg font-semibold text-primary">Most-used services</h2>
              <p className="text-sm text-muted-foreground">Jump straight to an official portal</p>
            </div>
            <Link href="/services" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              All {allServices.length} services
            </Link>
          </div>
          <div className="mt-4">
            <QuickServicesGrid />
          </div>
        </div>
      </section>

      <section aria-labelledby="explainer" className="border-y border-border bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
          <article>
            <h2 id="explainer" className="sr-only">How Seva Saathi helps</h2>
            <h3 className="text-lg font-semibold text-primary">One question, many departments</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Start with plain language. We map your situation to official portals and ordered life-event plans across departments.
            </p>
          </article>
          <article>
            <h3 className="text-lg font-semibold text-primary">Official sources only</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Every answer shows citations you can verify. We do not guess fees, dates, or eligibility when sources are missing.
            </p>
          </article>
          <article>
            <h3 className="text-lg font-semibold text-primary">Low bandwidth friendly</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Text-first pages, no autoplay video, and optional voice when Sarvam is configured. Checklists stay on your device.
            </p>
          </article>
        </div>
      </section>

      <section aria-labelledby="journeys" className="mx-auto max-w-6xl px-4 pt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-saffron">Life events</p>
            <h2 id="journeys" className="mt-1 text-3xl font-semibold text-primary">One flow, many departments</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Pick a life event—we bundle the agencies, order the steps, and track your progress like a delivery tracker.
            </p>
          </div>
          <Link href="/journeys" className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline">All guides <ArrowRight className="size-4" aria-hidden /></Link>
        </div>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {journeys.map((j) => (
            <li key={j.slug}>
              <Link href={`/journeys/${j.slug}`} className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span className="grid size-10 place-items-center rounded-lg bg-saffron-soft text-saffron"><Route className="size-5" aria-hidden /></span>
                <h3 className="mt-3 text-xl font-semibold">{j.title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{j.tagline}</p>
                <p className="mt-3 text-sm font-medium text-primary">{j.steps.length} steps <ArrowRight className="ml-0.5 inline size-4 transition group-hover:translate-x-1" aria-hidden /></p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="popular" className="mx-auto max-w-6xl px-4 pt-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-saffron">Popular services</p>
            <h2 id="popular" className="mt-1 text-3xl font-semibold text-primary">What most people look for</h2>
          </div>
          <Link href="/services" className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline">Browse all {allServices.length} <ArrowRight className="size-4" aria-hidden /></Link>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularServices.map((s) => (<li key={s.slug}><ServiceCard service={s} /></li>))}
        </ul>
      </section>

      <section aria-labelledby="topics" className="mx-auto max-w-6xl px-4 pt-16">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-saffron">Browse by topic</p>
        <h2 id="topics" className="mt-1 text-3xl font-semibold text-primary">Everything, grouped by what you need</h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/topics/${c.slug}`} className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <CategoryIcon name={c.icon} className="size-6 text-primary" />
                <span className="font-heading text-base font-semibold leading-snug">{c.name}</span>
                <span className="mt-auto text-xs text-muted-foreground">{counts[c.slug] ?? 0} services</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="updates" className="mx-auto max-w-6xl px-4 pt-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-saffron">Latest updates</p>
                <h2 id="updates" className="mt-1 text-3xl font-semibold text-primary">From the Press Information Bureau</h2>
              </div>
              <Link href="/updates" className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline">More updates <ArrowRight className="size-4" aria-hidden /></Link>
            </div>
            <div className="mt-6">
              <Suspense fallback={<UpdatesSkeleton rows={6} />}>
                <UpdatesList limit={6} />
              </Suspense>
            </div>
          </div>
          <aside aria-label="How Seva Saathi works" className="space-y-4 rounded-2xl bg-secondary p-6">
            <h2 className="text-xl font-semibold text-primary">How Seva Saathi is different</h2>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3"><BookCheck className="mt-0.5 size-5 shrink-0 text-india-green" aria-hidden /><span><strong>Official sources only.</strong> Every answer cites government websites, and says so when it does not know.</span></li>
              <li className="flex gap-3"><Route className="mt-0.5 size-5 shrink-0 text-india-green" aria-hidden /><span><strong>Whole journeys.</strong> One plan across Aadhaar, PAN, passport, EPFO and more, in the right order.</span></li>
              <li className="flex gap-3"><Link2 className="mt-0.5 size-5 shrink-0 text-india-green" aria-hidden /><span><strong>Hand-off, not hand-waving.</strong> Checklists, copy-ready form data and links to the official page.</span></li>
              <li className="flex gap-3"><Languages className="mt-0.5 size-5 shrink-0 text-india-green" aria-hidden /><span><strong>Speak your language.</strong> Voice and text in major Indian languages, powered by Sarvam AI when configured.</span></li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
