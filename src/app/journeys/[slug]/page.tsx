import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { journeyBySlug, journeys } from "@/data/journeys";
import { JourneyPlanner } from "@/components/journey-planner";
import { JourneyStepTracker } from "@/components/journey-step-tracker";
import { DelegationRoadmap } from "@/components/delegation-roadmap";
import { Breadcrumbs } from "@/components/breadcrumbs";

export function generateStaticParams() {
  return journeys.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: PageProps<"/journeys/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const j = journeyBySlug[slug];
  return j ? { title: j.title, description: j.tagline } : { title: "Guide not found" };
}

export default async function JourneyPage({ params }: PageProps<"/journeys/[slug]">) {
  const { slug } = await params;
  const journey = journeyBySlug[slug];
  if (!journey) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Life events", href: "/journeys" }, { label: journey.title }]} />
      <h1 className="mt-3 text-4xl font-semibold leading-tight text-primary">{journey.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-foreground/85">{journey.tagline}</p>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground"><strong>Who it&apos;s for:</strong> {journey.audience}</p>
      <p className="mt-2 text-xs text-muted-foreground">Guide last reviewed {new Date(journey.lastReviewed).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}. Fees and timings marked “unverified” have not been confirmed against an official page.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/ask?q=${encodeURIComponent(journey.triggers[0])}`} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Sparkles className="size-4 text-saffron" aria-hidden /> Ask a question about this
        </Link>
      </div>

      <div className="mt-8 space-y-6">
        <JourneyStepTracker journey={journey} />
        <JourneyPlanner journey={journey} />
      </div>
      <div className="mt-10">
        <DelegationRoadmap />
      </div>
    </div>
  );
}
