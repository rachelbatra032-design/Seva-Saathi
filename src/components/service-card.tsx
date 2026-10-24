import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import type { Service } from "@/lib/types";
import { categoryBySlug, stateLabel } from "@/lib/services";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/category-icon";

export function ServiceCard({ service }: { service: Service }) {
  const category = categoryBySlug[service.category];
  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-within:ring-2 focus-within:ring-ring">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="grid size-9 place-items-center rounded-lg bg-secondary text-primary">
          <CategoryIcon name={category?.icon ?? "landmark"} className="size-[18px]" />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          <Badge variant={service.level === "Central" ? "default" : "secondary"}>
            {service.level === "Central" ? "Central" : stateLabel(service.state) ?? "State"}
          </Badge>
        </div>
      </div>
      <h3 className="font-heading text-lg font-semibold leading-snug text-foreground">
        <Link
          href={`/services/${service.slug}`}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {service.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {service.summary}
      </p>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Building2 className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{service.ministry}</span>
        </span>
        <ArrowUpRight className="size-4 shrink-0 text-primary opacity-0 transition group-hover:opacity-100" aria-hidden />
      </div>
    </article>
  );
}
