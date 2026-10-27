import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/data/categories";
import { categoryCounts } from "@/lib/services";
import { CategoryIcon } from "@/components/category-icon";

export const metadata: Metadata = {
  title: "Browse by topic",
  description: "Government services grouped by what you need to do: identity, taxes, health, education, jobs and more.",
};

export default function TopicsPage() {
  const counts = categoryCounts();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-sm font-semibold text-primary">Topics</p>
      <h1 className="mt-2 text-4xl font-semibold text-primary">Browse by topic</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Start from what you want to get done. Each topic hub gathers the official sites for it in one place.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link href={`/topics/${c.slug}`} className="flex h-full gap-4 rounded-xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <CategoryIcon name={c.icon} className="size-5" />
              </span>
              <span>
                <span className="block font-heading text-lg font-semibold">{c.name}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{c.description}</span>
                <span className="mt-2 block text-xs font-medium text-primary">{counts[c.slug] ?? 0} services</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
