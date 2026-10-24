import { journeyBySlug } from "@/data/journeys";
import { getService } from "@/lib/services";
import type { AssistantProvider, GenerateInput, GenerateOutput } from "@/lib/assistant/types";

/**
 * Deterministic provider used when no LLM is configured. It never invents content: every
 * sentence is assembled from our curated journey and service data, and every claim carries
 * a [n] marker that points at the passage it came from.
 */
export const mockProvider: AssistantProvider = {
  name: "built-in matcher (no LLM)",
  async generate({ plan }: GenerateInput): Promise<GenerateOutput> {
    if (plan.intent === "journey" && plan.journeySlug) {
      const journey = journeyBySlug[plan.journeySlug];
      const lines: string[] = [];
      const used: number[] = [];
      lines.push(
        `Here is the usual order for “${journey.title}”. It involves several different offices, so I have put the steps in the order that avoids rework.`,
      );
      lines.push("");
      journey.steps.forEach((step, i) => {
        const marker = i + 2;
        used.push(marker);
        const tag = step.optional ? " (optional)" : "";
        lines.push(`${i + 1}. ${step.title}${tag}, with ${step.agency}. [${marker}]`);
      });
      lines.push("");
      lines.push(
        "Tick steps off in the checklist below as you go. I have not confirmed fees or timings from official pages, so check each official site before you pay anything.",
      );
      return { text: lines.join("\n"), used, supported: true };
    }

    if (plan.intent === "services" || plan.intent === "weak") {
      const lines: string[] = [];
      const used: number[] = [];
      if (plan.intent === "weak") {
        lines.push(
          "I am not fully certain this is what you are after, so treat this as a pointer rather than an answer. These are the closest official sources I have:",
        );
        lines.push("");
      }
      plan.passages.forEach((p, i) => {
        const s = p.serviceSlug ? getService(p.serviceSlug) : undefined;
        if (!s) return;
        used.push(i + 1);
        lines.push(`**${s.title}** (${s.ministry}). ${s.summary} [${i + 1}]`);
        const steps = (s.howToApply ?? []).slice(0, 4);
        steps.forEach((st, k) => lines.push(`${k + 1}. ${st}`));
        lines.push("");
      });
      lines.push("Use the official link below to do the actual application. Seva Saathi cannot submit anything for you.");
      return { text: lines.join("\n"), used, supported: used.length > 0 };
    }

    return { text: "", used: [], supported: false };
  },
};
