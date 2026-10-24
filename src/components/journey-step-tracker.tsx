"use client";

import { Check, Circle, CircleDashed } from "lucide-react";
import type { Journey } from "@/lib/types";
import { usePlans } from "@/lib/plan-store";
import { cn } from "@/lib/utils";

/** Parcel-tracker style horizontal step progress for a life-event journey. */
export function JourneyStepTracker({ journey }: { journey: Journey }) {
  const { plans } = usePlans();
  const done = plans[journey.slug]?.done ?? {};

  return (
    <nav aria-label={`Progress steps for ${journey.title}`} className="overflow-x-auto pb-1">
      <ol className="flex min-w-min items-start gap-0">
        {journey.steps.map((step, i) => {
          const complete = Boolean(done[step.id]);
          const waiting = step.dependsOn.some((d) => !done[d]);
          const active = !complete && !waiting;
          const Icon = complete ? Check : active ? Circle : CircleDashed;
          return (
            <li key={step.id} className="flex max-w-[7.5rem] flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {i > 0 && (
                  <span
                    aria-hidden
                    className={cn("h-0.5 flex-1", complete || active ? "bg-primary/50" : "bg-border")}
                  />
                )}
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-semibold",
                    complete && "border-india-green bg-india-green text-white",
                    active && "border-primary bg-primary text-primary-foreground",
                    !complete && !active && "border-muted-foreground/30 bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  <span className="sr-only">
                    Step {i + 1}: {step.title}
                    {complete ? ", completed" : active ? ", current" : ", waiting"}
                  </span>
                </span>
                {i < journey.steps.length - 1 && (
                  <span
                    aria-hidden
                    className={cn("h-0.5 flex-1", complete ? "bg-india-green/60" : "bg-border")}
                  />
                )}
              </div>
              <p className="mt-1.5 line-clamp-2 px-1 text-center text-[10px] leading-tight text-muted-foreground">
                {step.title}
              </p>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
