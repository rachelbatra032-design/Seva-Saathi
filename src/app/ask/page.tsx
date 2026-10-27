import type { Metadata } from "next";
import { Suspense } from "react";
import { AskChat } from "@/components/ask-chat";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Ask Seva Saathi",
  description:
    "Describe a situation in your own words and get a guided, cited plan from official sources, in text or by voice, in Indian languages.",
};

export default function AskPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm font-semibold text-primary">Ask Seva Saathi</p>
      <h1 className="mt-2 text-4xl font-semibold text-primary">Tell us what happened. We&apos;ll map the steps.</h1>
      <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
        Answers come only from official government sources that we have on file, and every answer shows its links. When we don&apos;t know, we say so.
      </p>
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="mx-auto h-64 max-w-3xl rounded-2xl" />}>
          <AskChat />
        </Suspense>
      </div>
    </div>
  );
}
