import Link from "next/link";
import { Logo } from "@/components/site-header";
import { categories } from "@/data/categories";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="inline-block rounded-lg bg-background px-3 py-2 text-foreground">
            <Logo />
          </div>
          <p className="max-w-md text-sm leading-relaxed text-primary-foreground/80">
            Seva Saathi is an independent, unofficial project. It is not affiliated with the
            Government of India. We collect links to official websites and summarise how to use
            them. For anything that matters (applications, payments, legal status) always go to
            the official site we link to, and check it there.
          </p>
          <p className="text-sm text-primary-foreground/80">
            The government&apos;s own portal:{" "}
            <a
              className="font-medium text-white underline underline-offset-2"
              href="https://www.india.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
            >
              india.gov.in
            </a>
          </p>
        </div>
        <nav aria-label="Topics" className="text-sm">
          <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-saffron">
            Browse topics
          </h2>
          <ul className="grid gap-2">
            {categories.slice(0, 7).map((c) => (
              <li key={c.slug}>
                <Link className="text-primary-foreground/85 hover:text-white hover:underline" href={`/topics/${c.slug}`}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Explore" className="text-sm">
          <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-saffron">
            Explore
          </h2>
          <ul className="grid gap-2">
            <li><Link className="text-primary-foreground/85 hover:text-white hover:underline" href="/ask">Ask Seva Saathi</Link></li>
            <li><Link className="text-primary-foreground/85 hover:text-white hover:underline" href="/journeys">Life-event guides</Link></li>
            <li><Link className="text-primary-foreground/85 hover:text-white hover:underline" href="/services">Services directory</Link></li>
            <li><Link className="text-primary-foreground/85 hover:text-white hover:underline" href="/updates">Latest updates</Link></li>
            <li><Link className="text-primary-foreground/85 hover:text-white hover:underline" href="/about">About and data sources</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/15 py-4 text-center text-xs text-primary-foreground/70">
        Content last reviewed 24 October 2026. Not an official government website.
      </div>
    </footer>
  );
}
