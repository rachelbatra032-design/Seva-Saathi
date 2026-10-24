export type Citation = {
  /** Stable id within a reply, used for [n] markers. */
  n: number;
  title: string;
  url: string;
  publisher: string;
  /** "page" is the official page itself; "snapshot" means we also hold fetched text from it. */
  kind: "page" | "snapshot";
};

export type Intent = "journey" | "services" | "weak" | "refusal";

export type Passage = {
  id: string;
  type: "journey" | "journey-step" | "service";
  title: string;
  text: string;
  sources: { title: string; url: string; publisher: string; snapshot?: boolean }[];
  score: number;
  journeySlug?: string;
  serviceSlug?: string;
};

export type Plan = {
  intent: Intent;
  journeySlug?: string;
  serviceSlugs: string[];
  passages: Passage[];
  confidence: number;
  refusalReason?: "no-match" | "personal-record" | "out-of-scope" | "translation-unavailable";
};

export type GenerateInput = {
  query: string;
  plan: Plan;
};

export type GenerateOutput = {
  /** Answer text with [n] markers that refer to plan.passages order (1-based). */
  text: string;
  /** Passage numbers (1-based) the answer relied on. */
  used: number[];
  supported: boolean;
};

export interface AssistantProvider {
  name: string;
  generate(input: GenerateInput): Promise<GenerateOutput>;
}

export type AssistantReply = {
  id: string;
  intent: Intent;
  text: string;
  journeySlug?: string;
  serviceSlugs: string[];
  citations: Citation[];
  grounded: boolean;
  provider: string;
  language: string;
  translation?: {
    from: string;
    to: string;
    provider: "sarvam" | "mock" | "none";
    note?: string;
  };
  followUps: string[];
};
