"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SearchX, X } from "lucide-react";
import type { CategorySlug, Service } from "@/lib/types";
import { categories } from "@/data/categories";
import { states } from "@/data/states";
import { searchServices } from "@/lib/services";
import { ServiceCard } from "@/components/service-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const LEVELS = [
  { value: "all", label: "All" },
  { value: "Central", label: "Central" },
  { value: "State", label: "State / UT" },
] as const;

export function ServiceDirectory({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const query = params.get("q") ?? "";
  const category = (params.get("category") ?? "all") as CategorySlug | "all";
  const level = (params.get("level") ?? "all") as "all" | "Central" | "State";
  const state = params.get("state") ?? "all";

  const [draft, setDraft] = useState(query);
  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    if (draft.trim() !== query) setDraft(query);
  }

  const update = useCallback(
    (next: Record<string, string>) => {
      const sp = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(next)) {
        if (!v || v === "all") sp.delete(k);
        else sp.set(k, v);
      }
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const results: Service[] = useMemo(
    () => searchServices({ query, category, level, state }),
    [query, category, level, state],
  );

  const hasFilters = Boolean(query) || category !== "all" || level !== "all" || state !== "all";
  const stateDisabled = level === "Central";

  return (
    <div>
      <form
        role="search"
        aria-label="Search the services directory"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: draft.trim() });
        }}
        className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <label htmlFor="svc-q" className="sr-only">Search services</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              id="svc-q"
              type="search"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                update({ q: e.target.value.trim() });
              }}
              placeholder="Try “passport”, “scholarship”, “driving licence”…"
              className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoComplete="off"
            />
          </div>
          <Button type="submit" size="lg" className="h-11 px-5">Search</Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <label htmlFor="svc-cat" className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
            <select id="svc-cat" className={selectClass} value={category} onChange={(e) => update({ category: e.target.value })}>
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <fieldset>
            <legend className="mb-1 block text-xs font-medium text-muted-foreground">Level of government</legend>
            <div className="inline-flex w-full overflow-hidden rounded-lg border border-input" role="radiogroup">
              {LEVELS.map((l) => (
                <label
                  key={l.value}
                  className={cn(
                    "flex-1 cursor-pointer px-2 py-2.5 text-center text-sm font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-ring",
                    level === l.value ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted",
                  )}
                >
                  <input
                    type="radio"
                    name="level"
                    value={l.value}
                    checked={level === l.value}
                    onChange={() => update({ level: l.value, state: l.value === "Central" ? "all" : state })}
                    className="sr-only"
                  />
                  {l.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="svc-state" className="mb-1 block text-xs font-medium text-muted-foreground">State or union territory</label>
            <select
              id="svc-state"
              className={cn(selectClass, stateDisabled && "opacity-50")}
              value={state}
              disabled={stateDisabled}
              onChange={(e) => update({ state: e.target.value, level: e.target.value === "all" ? level : "State" })}
            >
              <option value="all">All states and UTs</option>
              {states.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {hasFilters ? (
            <>Showing <strong className="text-foreground">{results.length}</strong> of {total} services</>
          ) : (
            <>{total} services from central and state governments</>
          )}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setDraft("");
              router.replace(pathname, { scroll: false });
            }}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden /> Clear filters
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center">
          <SearchX className="mx-auto size-8 text-muted-foreground" aria-hidden />
          <h2 className="mt-3 text-xl font-semibold">No services match your search</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Try fewer or simpler words, or remove a filter. If this is a real need, our assistant can
            tell you which official site to try, and it will say plainly when it does not know.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => { setDraft(""); router.replace(pathname, { scroll: false }); }}>
              Reset search
            </Button>
            <Link
              href={`/ask${query ? `?q=${encodeURIComponent(query)}` : ""}`}
              className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Ask India.Gov instead
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((s) => (
            <li key={s.slug}>
              <ServiceCard service={s} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
