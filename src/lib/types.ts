export type CategorySlug =
  | "identity"
  | "taxes-finance"
  | "health"
  | "education"
  | "jobs-labour"
  | "agriculture"
  | "transport"
  | "housing"
  | "social-welfare"
  | "legal-grievances"
  | "business"
  | "digital-services"
  | "state-portals";

export type Category = {
  slug: CategorySlug;
  name: string;
  description: string;
  icon: string;
};

export type Level = "Central" | "State";

export type Service = {
  slug: string;
  title: string;
  summary: string;
  category: CategorySlug;
  level: Level;
  /** State or UT code (see data/states.ts) when level is "State". */
  state?: string;
  url: string;
  ministry: string;
  languages: string[];
  popular?: boolean;
  tags?: string[];
  whoFor?: string;
  howToApply?: string[];
  documents?: string[];
};

export type LinkStatus = "ok" | "blocked" | "unreachable" | "unchecked";

export type LinkCheck = {
  status: LinkStatus;
  httpCode?: number;
  checkedAt: string;
  finalUrl?: string;
};

export type OfficialSnippet = {
  url: string;
  title?: string;
  description?: string;
  headings?: string[];
  fetchedAt: string;
};

export type StateInfo = {
  code: string;
  name: string;
  type: "State" | "UT";
};

export type JourneyLink = {
  label: string;
  url: string;
};

export type ProfileFieldKey =
  | "previousName"
  | "newName"
  | "dob"
  | "spouseName"
  | "fatherName"
  | "marriageDate"
  | "marriagePlace"
  | "mobile"
  | "email"
  | "currentAddress"
  | "newAddress"
  | "newState";

export type Verified = {
  text: string;
  /** true only if confirmed against an official page we could read; otherwise treat as indicative. */
  verified: boolean;
  source?: string;
};

export type JourneyStep = {
  id: string;
  title: string;
  agency: string;
  summary: string;
  dependsOn: string[];
  optional?: boolean;
  /** Plain-language condition when the step applies only sometimes. */
  condition?: string;
  howTo: string[];
  documents: string[];
  links: JourneyLink[];
  /** Related directory entries, by slug. */
  serviceSlugs?: string[];
  time?: Verified;
  fee?: Verified;
  /** Profile fields used to build the form-fill summary for this step. */
  prefill: ProfileFieldKey[];
  /** What the user must still confirm on the official site. */
  caveat?: string;
  /** True when the exact process depends on the state; link to state directory. */
  stateSpecific?: boolean;
};

export type Journey = {
  slug: string;
  title: string;
  tagline: string;
  audience: string;
  /** Phrases/keywords that signal this journey in a query. */
  triggers: string[];
  steps: JourneyStep[];
  profileFields: ProfileFieldKey[];
  lastReviewed: string;
};
