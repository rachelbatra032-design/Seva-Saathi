import type { Metadata } from "next";
import { Suspense } from "react";
import { ServiceDirectory } from "@/components/service-directory";
import { allServices } from "@/lib/services";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Services directory",
  description:
    "Search and filter central and state government services in one directory, each linking to the official site.",
};

function DirectorySkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading the services directory…</span>
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-sm font-semibold text-primary">Services directory</p>
      <h1 className="mt-2 text-4xl font-semibold text-primary">Find the right official site, fast</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        A curated list of government services with plain-language descriptions. Filter by topic,
        by central or state government, or by state. Every entry links to the official website,
        where the actual application happens.
      </p>
      <div className="mt-8">
        <Suspense fallback={<DirectorySkeleton />}>
          <ServiceDirectory total={allServices.length} />
        </Suspense>
      </div>
    </div>
  );
}
