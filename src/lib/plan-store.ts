"use client";

import { useCallback } from "react";
import { useLocalState } from "@/lib/local-store";
import type { ProfileFieldKey } from "@/lib/types";

export type PlanState = {
  startedAt: string;
  /** Keys: "<stepId>" for steps, "<stepId>:doc:<index>" for documents. */
  done: Record<string, boolean>;
};

type Plans = Record<string, PlanState>;
export type Profile = Partial<Record<ProfileFieldKey, string>>;

const PLANS_KEY = "seva-saathi:plans:v1";
const PROFILE_KEY = "seva-saathi:profile:v1";
const EMPTY_PLANS: Plans = {};
const EMPTY_PROFILE: Profile = {};

export function usePlans() {
  const [plans, update] = useLocalState<Plans>(PLANS_KEY, EMPTY_PLANS);

  const start = useCallback(
    (slug: string) =>
      update((p) => (p[slug] ? p : { ...p, [slug]: { startedAt: new Date().toISOString(), done: {} } })),
    [update],
  );
  const toggle = useCallback(
    (slug: string, key: string) =>
      update((p) => {
        const cur = p[slug] ?? { startedAt: new Date().toISOString(), done: {} };
        const done = { ...cur.done };
        if (done[key]) delete done[key];
        else done[key] = true;
        return { ...p, [slug]: { ...cur, done } };
      }),
    [update],
  );
  const reset = useCallback(
    (slug: string) =>
      update((p) => {
        const next = { ...p };
        delete next[slug];
        return next;
      }),
    [update],
  );
  return { plans, start, toggle, reset };
}

export function useProfile() {
  const [profile, update] = useLocalState<Profile>(PROFILE_KEY, EMPTY_PROFILE);
  const setField = useCallback(
    (key: ProfileFieldKey, value: string) => update((p) => ({ ...p, [key]: value })),
    [update],
  );
  const clear = useCallback(() => update(() => ({})), [update]);
  return { profile, setField, clear };
}

export const PROFILE_LABELS: Record<ProfileFieldKey, { label: string; hint?: string; type?: string }> = {
  previousName: { label: "Name as on your current documents" },
  newName: { label: "New name you want" },
  dob: { label: "Date of birth", type: "date" },
  spouseName: { label: "Spouse's name" },
  fatherName: { label: "Father's name" },
  marriageDate: { label: "Date of marriage", type: "date" },
  marriagePlace: { label: "Place of marriage (town, state)" },
  mobile: { label: "Mobile number", type: "tel" },
  email: { label: "Email address", type: "email" },
  currentAddress: { label: "Current address" },
  newAddress: { label: "New address" },
  newState: { label: "State or UT you are moving to" },
};
