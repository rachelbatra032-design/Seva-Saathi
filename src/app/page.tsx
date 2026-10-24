import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, BookCheck, Languages, Link2, Route } from "lucide-react";
import { categories } from "@/data/categories";
import { journeys } from "@/data/journeys";
import { allServices, categoryCounts, popularServices } from "@/lib/services";
import { HeroForms } from "@/components/hero-forms";
import { ServiceCard } from "@/components/service-card";
import { CategoryIcon } from "@/components/category-icon";
import { UpdatesList, UpdatesSkeleton } from "@/components/updates-list";

export default function HomePage() {
  const counts = categoryCounts();
  const centralCount = allServices.filter((s) => s.level === "Central").length;

  return (
    <>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 flex h-1.5">
          <span className="flex-1 bg-saffron" /><span className="flex-1 bg-white" /><span className="flex-1 bg-india-green" />
        </div>
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[28rem] rounded-full border-[28px] border-white/5" />
        <div aria-hidden className="pointer-events-none absolute -right-8 top-24 size-72 rounded-full border-[18px] border-saffron/10" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:pt-20">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-saffron">One place for Indian government services</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.1] sm:text-5xl">
            Stop chasing between government websites. Start with what happened.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/85">
            Seva Saathi gathers {allServices.length} official services and turns life events, like a marriage, a lost document or a move, into one ordered plan with a link to the official site for every step.
          </p>
          <HeroForms />
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-3 text-sm">
            <div><dt className="text-primary-foreground/70">Services indexed</dt><dd className="text-2xl font-semibold">{allServices.length}</dd></div>
            <div><dt className="text-primary-foreground/70">Central programmes</dt><dd className="text-2xl font-semibold">{centralCount}</dd></div>
            <div><dt className="text-primary-foreground/70">Life-event guides</dt><dd className="text-2xl font-semibold">{journeys.length}</dd></div>
            <div><dt className="text-primary-foreground/70">Voice languages</dt><dd className="text-2xl font-semibold">22</dd></div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="journeys" className="mx-auto max-w-6xl px-4 pt-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-saffron">Life events</p>
            <h2 id="journeys" className="mt-1 text-3xl font-semibold text-primary">Plans that span many offices</h2>
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
