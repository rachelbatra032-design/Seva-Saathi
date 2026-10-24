import type { Journey } from "@/lib/types";
import { PROFILE_LABELS, type Profile } from "@/lib/plan-store";

/** Copy-ready summary of profile + remaining steps for a journey. */
export function buildJourneySummary(journey: Journey, profile: Profile, done: Record<string, boolean>) {
  const lines: string[] = [
    `Seva Saathi — ${journey.title} (unofficial guide)`,
    `Generated ${new Date().toISOString().slice(0, 10)}`,
    "",
    "Your details (from browser profile):",
  ];
  for (const k of journey.profileFields) {
    const v = profile[k]?.trim();
    if (v) lines.push(`- ${PROFILE_LABELS[k].label}: ${v}`);
  }
  lines.push("", "Steps:");
  journey.steps.forEach((s, i) => {
    const tick = done[s.id] ? "[done]" : "[ ]";
    lines.push(`${tick} ${i + 1}. ${s.title} (${s.agency})`);
    const link = s.links[0];
    if (link) lines.push(`    Official: ${link.url}`);
  });
  lines.push("", "Confirm every fee and deadline on the official site before acting.");
  return lines.join("\n");
}
