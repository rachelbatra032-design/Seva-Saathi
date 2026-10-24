import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="mx-auto max-w-6xl space-y-4 px-4 py-12">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
      <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-40 rounded-xl" />))}
      </div>
    </div>
  );
}
