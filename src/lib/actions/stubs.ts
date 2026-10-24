import { randomUUID } from "node:crypto";
import type { ConsentGrant, ConsentRequest, ConsentScope } from "@/lib/actions/types";
import { journeyBySlug } from "@/data/journeys";
import { buildJourneySummary } from "@/lib/journey-summary";

const SCOPE_LABELS: Record<ConsentScope, string> = {
  "digilocker-read-metadata": "DigiLocker (roadmap): read issued document metadata with your consent",
  "apisetu-prefill": "API Setu (roadmap): prefill a government form from your profile",
  "delegated-submit": "Delegated submit (roadmap): only where an official API exists — not available in v1",
};

export function grantMockConsent(req: ConsentRequest): ConsentGrant {
  const now = Date.now();
  return {
    id: randomUUID(),
    scope: req.scope,
    grantedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 15 * 60_000).toISOString(),
    mockToken: `mock_${req.scope}_${randomUUID().slice(0, 8)}`,
    label: SCOPE_LABELS[req.scope],
  };
}

export function digilockerAuthorizeUrl(consentId: string): string {
  return `https://www.digilocker.gov.in/?seva_saathi_roadmap=1&consent=${encodeURIComponent(consentId)}&note=stub-not-oauth`;
}

export function prefillForJourney(slug: string, profile: Record<string, string>) {
  const journey = journeyBySlug[slug];
  if (!journey) return null;
  const summary = buildJourneySummary(journey, profile, {});
  return {
    journeySlug: slug,
    summary,
    deepLinks: journey.steps.flatMap((s) => s.links.map((l) => ({ stepId: s.id, label: l.label, url: l.url }))),
    disclaimer: "Seva Saathi does not submit anything. Copy these details into the official form yourself.",
  };
}
