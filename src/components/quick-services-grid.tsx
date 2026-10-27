import Link from "next/link";
import { popularServices } from "@/lib/services";
import { CategoryIcon } from "@/components/category-icon";
import { categoryBySlug } from "@/data/categories";

/** Compact “most used” grid — pinned near the top of the home page. */
export function QuickServicesGrid() {
  const items = popularServices.slice(0, 12);
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((s) => {
        const cat = categoryBySlug[s.category];
        return (
          <li key={s.slug}>
            <Link
              href={`/services/${s.slug}`}
              className="flex h-full min-h-[4.5rem] flex-col justify-between gap-1 rounded-md border border-border bg-card px-2.5 py-2 text-left shadow-sm transition hover:border-primary hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CategoryIcon name={cat?.icon ?? "landmark"} className="size-4 text-primary" />
              <span className="line-clamp-2 text-xs font-medium leading-snug text-foreground">{s.title}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
