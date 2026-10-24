import { ArrowUpRight, CloudOff, Inbox } from "lucide-react";
import { getPibUpdates } from "@/lib/pib";
import { Skeleton } from "@/components/ui/skeleton";
import { OfficialLinkButton } from "@/components/official-link-button";

const FALLBACK_SOURCES = [
  { label: "PIB press releases", url: "https://pib.gov.in/" },
  { label: "MyGov announcements", url: "https://www.mygov.in/" },
  { label: "National Portal of India", url: "https://www.india.gov.in/" },
];

export function UpdatesSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="divide-y divide-border rounded-xl border border-border bg-card">
      <span className="sr-only">Loading the latest official updates…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2 p-4">
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export async function UpdatesList({ limit = 6 }: { limit?: number }) {
  const result = await getPibUpdates(limit);

  if (!result.ok) {
    return (
      <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-start gap-3">
          <CloudOff className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
          <div className="space-y-3">
            <p className="font-medium">We couldn&apos;t load the latest press releases right now.</p>
            <p className="text-sm text-muted-foreground">
              The official feed from the Press Information Bureau did not respond. Nothing is
              wrong with your device. You can read the announcements directly at the source:
            </p>
            <ul className="flex flex-wrap gap-2">
              {FALLBACK_SOURCES.map((s) => (
                <li key={s.url}>
                  <OfficialLinkButton href={s.url} variant="outline">
                    {s.label}
                  </OfficialLinkButton>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (result.items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <Inbox className="mx-auto mb-2 size-6 text-muted-foreground" aria-hidden />
        <p className="font-medium">No updates are available at the moment.</p>
        <p className="mt-1 text-sm text-muted-foreground">Check the source directly:</p>
        <div className="mt-3">
          <OfficialLinkButton href={result.sourceUrl} variant="outline">PIB press releases</OfficialLinkButton>
        </div>
      </div>
    );
  }

  const fetched = new Date(result.fetchedAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

  return (
    <div>
      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {result.items.map((item) => (
          <li key={item.link}>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-4 p-4 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <span>
                <span className="block font-medium leading-snug text-foreground group-hover:text-primary">
                  {item.title}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Source: {result.source}
                </span>
              </span>
              <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden />
              <span className="sr-only">(opens the original press release on pib.gov.in)</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Headlines are read from the official{" "}
        <a className="underline underline-offset-2" href="https://www.pib.gov.in/RssMain.aspx" target="_blank" rel="noopener noreferrer">
          PIB RSS feed
        </a>{" "}
        and refreshed about every 15 minutes (last fetched {fetched} IST). The feed does not
        include publication dates, so open the release for the exact date.
      </p>
    </div>
  );
}
