import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, categoryBySlug } from "@/data/categories";
import { servicesInCategory } from "@/lib/services";
import { journeys } from "@/data/journeys";
import { ServiceCard } from "@/components/service-card";
import { CategoryIcon } from "@/components/category-icon";
import { Suspense } from "react";
import { UpdatesList, UpdatesSkeleton } from "@/components/updates-list";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/topics/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = categoryBySlug[slug];
  return c ? { title: c.name, description: c.description } : { title: "Topic not found" };
}

export default async function TopicPage({ params }: PageProps<"/topics/[slug]">) {
  const { slug } = await params;
  const category = categoryBySlug[slug];
  if (!category) notFound();
  const services = servicesInCategory(category.slug);
  const central = services.filter((s) => s.level === "Central");
  const state = services.filter((s) => s.level === "State");
  const relatedJourneys = journeys.filter((j) =>
    j.steps.some((st) => st.serviceSlugs?.some((sl) => services.some((s) => s.slug === sl))),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link className="hover:underline" href="/topics">Topics</Link> / {category.name}
      </nav>
      <div className="mt-4 flex items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <CategoryIcon name={category.icon} className="size-7" />
        </span>
        <div>
          <h1 className="text-4xl font-semibold text-primary">{category.name}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>
        </div>
      </div>

      {relatedJourneys.length > 0 && (
        <section aria-labelledby="journeys" className="mt-10 rounded-2xl bg-saffron-soft p-5">
          <h2 id="journeys" className="text-xl font-semibold text-primary">Step-by-step life-event guides</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {relatedJourneys.map((j) => (
              <li key={j.slug}>
                <Link href={`/journeys/${j.slug}`} className="inline-flex rounded-full bg-background px-3.5 py-1.5 text-sm font-medium shadow-sm hover:bg-muted">{j.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {central.length > 0 && (
        <section aria-labelledby="central" className="mt-10">
          <h2 id="central" className="text-2xl font-semibold">Central government</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {central.map((s) => (<li key={s.slug}><ServiceCard service={s} /></li>))}
          </ul>
        </section>
      )}
      {state.length > 0 && (
        <section aria-labelledby="state" className="mt-12">
          <h2 id="state" className="text-2xl font-semibold">State and UT governments</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.map((s) => (<li key={s.slug}><ServiceCard service={s} /></li>))}
          </ul>
        </section>
      )}
      {services.length === 0 && (
        <p className="mt-10 rounded-xl border border-dashed p-8 text-center text-muted-foreground">No services are listed in this topic yet.</p>
      )}

      <section aria-labelledby="latest" className="mt-14">
        <h2 id="latest" className="text-2xl font-semibold">Latest from official sources</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">General government announcements from PIB; topic-specific feeds are on the roadmap.</p>
        <Suspense fallback={<UpdatesSkeleton rows={4} />}>
          <UpdatesList limit={4} />
        </Suspense>
      </section>
    </div>
  );
}
