import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-saffron">Error 404</p>
      <h1 className="mt-2 text-4xl font-semibold text-primary">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-muted-foreground">The page may have moved, or the address may be mistyped. You can search the directory or ask the assistant instead.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/services" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Search services</Link>
        <Link href="/ask" className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium hover:bg-muted">Ask Seva Saathi</Link>
      </div>
    </div>
  );
}
