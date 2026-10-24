/** Stage 2/3 roadmap — no real OAuth or submissions in v1. */

export type ConsentScope = "digilocker-read-metadata" | "apisetu-prefill" | "delegated-submit";

export type ConsentRequest = {
  scope: ConsentScope;
  journeySlug?: string;
  stepId?: string;
};

export type ConsentGrant = {
  id: string;
  scope: ConsentScope;
  grantedAt: string;
  expiresAt: string;
  /** Mock token only — never a real government credential. */
  mockToken: string;
  label: string;
};
