import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/categories";
import { allServices, categoryCounts, popularServices } from "@/lib/services";
import { HeroForms } from "@/components/hero-forms";
import { HomeUseCases } from "@/components/home-use-cases";
import { QuickServicesGrid } from "@/components/quick-services-grid";
import { ServiceCard } from "@/components/service-card";
import { CategoryIcon } from "@/components/category-icon";
import { UpdatesList, UpdatesSkeleton } from "@/components/updates-list";

export default function HomePage() {
  const counts = categoryCounts();

  return (
    <>
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 pb-14 pt-10 sm:pb-16 sm:pt-14 md:max-w-4xl md:px-6 lg:max-w-5xl">
          <p className="text-sm text-muted-foreground">Ask in plain language—we answer from official sources with links.</p>
          <h1 className="sr-only">Seva Saathi home</h1>
          <HeroForms variant="editorial" />
        </div>
      </section>

      <HomeUseCases />

      <section aria-labelledby="quick-services" className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="quick-services" className="text-base font-semibold text-foreground/90">
                Most-used services
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Official portals, grouped for quick access</p>
            </div>
            <Link
              href="/services"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              All {allServices.length} services
            </Link>
          </div>
          <div className="mt-5 opacity-95">
            <QuickServicesGrid />
          </div>
        </div>
      </section>

      <section aria-labelledby="popular" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="popular" className="text-base font-semibold text-foreground/90">Popular services</h2>
            <Link
              href="/services"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Browse directory <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularServices.slice(0, 6).map((s) => (
              <li key={s.slug}>
                <ServiceCard service={s} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="topics" className="border-b border-border bg-muted/15">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
          <h2 id="topics" className="text-base font-semibold text-foreground/90">Browse by topic</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Explore the full services directory by category</p>
          <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/topics/${c.slug}`}
                  className="flex h-full flex-col gap-2 rounded-lg border border-border/80 bg-card/80 px-3 py-3 text-sm transition hover:border-primary/25 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <CategoryIcon name={c.icon} className="size-4 text-primary/80" />
                  <span className="font-medium leading-snug text-foreground/90">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{counts[c.slug] ?? 0} services</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="updates" className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="updates" className="text-base font-semibold text-foreground/90">Latest updates</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Headlines from the Press Information Bureau</p>
            </div>
            <Link
              href="/updates"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              More updates <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-5 max-w-3xl">
            <Suspense fallback={<UpdatesSkeleton rows={4} />}>
              <UpdatesList limit={4} />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
