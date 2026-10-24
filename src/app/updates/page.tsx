import type { Metadata } from "next";
import { Suspense } from "react";
import { UpdatesList, UpdatesSkeleton } from "@/components/updates-list";
import { OfficialLinkButton } from "@/components/official-link-button";

export const metadata: Metadata = {
  title: "Latest official updates",
  description: "Recent press releases from the Government of India, read from the Press Information Bureau feed.",
};

export default function UpdatesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-saffron">Latest updates</p>
      <h1 className="mt-2 text-4xl font-semibold text-primary">Announcements from official sources</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Headlines come straight from the Press Information Bureau, the Government of India&apos;s
        nodal agency for official announcements. We only show the title and link to the original.
      </p>
      <div className="mt-8">
        <Suspense fallback={<UpdatesSkeleton rows={12} />}>
          <UpdatesList limit={30} />
        </Suspense>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl bg-muted p-5 text-sm">
        <p className="flex-1">More feeds (ministry notifications, state gazettes, scheme alerts) are on the roadmap.</p>
        <OfficialLinkButton href="https://pib.gov.in/" variant="outline">Open PIB</OfficialLinkButton>
      </div>
    </div>
  );
}
