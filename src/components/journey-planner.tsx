"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, ChevronDown, ClipboardCopy, Clock, FileText, IndianRupee, Lock, RotateCcw, ShieldCheck, UserRound } from "lucide-react";
import type { Journey, JourneyStep } from "@/lib/types";
import { PROFILE_LABELS, usePlans, useProfile } from "@/lib/plan-store";
import { OfficialLinkButton } from "@/components/official-link-button";
import { LinkStatusNote } from "@/components/link-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function useProgress(journey: Journey) {
  const { plans, start, toggle, reset } = usePlans();
  const state = plans[journey.slug];
  const done = state?.done ?? {};
  const required = journey.steps.filter((s) => !s.optional);
  const completedRequired = required.filter((s) => done[s.id]).length;
  const completedAll = journey.steps.filter((s) => done[s.id]).length;
  return { state, done, start, toggle, reset, required, completedRequired, completedAll };
}

export function ProgressSummary({ journey }: { journey: Journey }) {
  const { completedRequired, required, completedAll } = useProgress(journey);
  const pct = required.length ? Math.round((completedRequired / required.length) * 100) : 0;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">
          {completedRequired} of {required.length} required steps done
        </span>
        <span className="text-muted-foreground">
          {completedAll}/{journey.steps.length} including optional
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`Progress on ${journey.title}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-india-green transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Your ticks are saved only in this browser (local storage). Nothing is sent to us.</p>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        setState(document.execCommand("copy") ? "copied" : "failed");
      } catch {
        setState("failed");
      }
      ta.remove();
    }
    setTimeout(() => setState("idle"), 2200);
  }
  return (
    <Button type="button" variant="outline" size="sm" onClick={copy}>
      {state === "copied" ? <Check className="size-3.5" aria-hidden /> : <ClipboardCopy className="size-3.5" aria-hidden />}
      {state === "copied" ? "Copied" : state === "failed" ? "Copy failed, select manually" : "Copy details"}
      <span className="sr-only" role="status" aria-live="polite">{state === "copied" ? "Details copied to clipboard" : ""}</span>
    </Button>
  );
}

function Verification({ item, icon }: { item: { text: string; verified: boolean }; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <p>
        <span>{item.text}</span>{" "}
        {item.verified ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-india-green"><ShieldCheck className="size-3.5" aria-hidden />Verified from official page</span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded bg-saffron-soft px-1.5 py-0.5 text-xs font-medium text-foreground/80"><AlertTriangle className="size-3" aria-hidden />Unverified, check the official site</span>
        )}
      </p>
    </div>
  );
}

function StepCard({ journey, step, index, titleById }: { journey: Journey; step: JourneyStep; index: number; titleById: Record<string, string> }) {
  const { done, toggle, start } = useProgress(journey);
  const { profile } = useProfile();
  const isDone = Boolean(done[step.id]);
  const waiting = step.dependsOn.filter((d) => !done[d]);
  const [open, setOpen] = useState(false);

  const summary = useMemo(
    () =>
      step.prefill
        .map((k) => `${PROFILE_LABELS[k].label}: ${profile[k]?.trim() || "(add in “Your details”)"}`)
        .join("\n"),
    [step.prefill, profile],
  );
  const docsDone = step.documents.filter((_, i) => done[`${step.id}:doc:${i}`]).length;
  const checkId = `step-${step.id}`;

  return (
    <li className={cn("rounded-2xl border bg-card transition", isDone ? "border-india-green/40 bg-india-green-soft/50" : "border-border")}>
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <div className="pt-0.5">
          <input
            id={checkId}
            type="checkbox"
            checked={isDone}
            onChange={() => {
              start(journey.slug);
              toggle(journey.slug, step.id);
            }}
            className="size-5 cursor-pointer accent-[var(--india-green)]"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Step {index + 1}</span>
            {step.optional && <Badge variant="outline">Optional</Badge>}
            {step.stateSpecific && <Badge variant="secondary">Depends on your state</Badge>}
          </div>
          <label htmlFor={checkId} className={cn("mt-1 block cursor-pointer font-heading text-lg font-semibold leading-snug", isDone && "text-muted-foreground line-through decoration-1")}>
            {step.title}
          </label>
          <p className="mt-0.5 text-sm text-muted-foreground">{step.agency}</p>
          {step.condition && <p className="mt-2 text-sm italic text-foreground/70">{step.condition}</p>}
          {waiting.length > 0 && !isDone && (
            <p className="mt-2 inline-flex items-start gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs text-foreground/80">
              <Lock className="mt-0.5 size-3 shrink-0" aria-hidden />
              Best done after: {waiting.map((w) => titleById[w]).join("; ")}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {step.links.slice(0, 1).map((l) => (
              <OfficialLinkButton key={l.url} href={l.url} className="py-2">{l.label}</OfficialLinkButton>
            ))}
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls={`${checkId}-details`}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {open ? "Hide details" : "How, documents and form data"}
              <ChevronDown className={cn("size-4 transition", open && "rotate-180")} aria-hidden />
            </button>
          </div>

          {open && (
            <div id={`${checkId}-details`} className="mt-5 space-y-6 border-t border-border pt-5">
              <p className="leading-relaxed text-foreground/85">{step.summary}</p>

              <div>
                <h4 className="text-sm font-semibold">How to do it</h4>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-foreground/85">
                  {step.howTo.map((h) => (<li key={h}>{h}</li>))}
                </ol>
              </div>

              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="size-4 text-saffron" aria-hidden />
                  Documents to gather
                  <span className="font-normal text-muted-foreground">({docsDone}/{step.documents.length} ready)</span>
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {step.documents.map((d, i) => {
                    const id = `${checkId}-doc-${i}`;
                    return (
                      <li key={d} className="flex items-start gap-2 text-sm">
                        <input
                          id={id}
                          type="checkbox"
                          checked={Boolean(done[`${step.id}:doc:${i}`])}
                          onChange={() => { start(journey.slug); toggle(journey.slug, `${step.id}:doc:${i}`); }}
                          className="mt-0.5 size-4 cursor-pointer accent-[var(--india-green)]"
                        />
                        <label htmlFor={id} className="cursor-pointer">{d}</label>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="grid gap-2">
                {step.time && <Verification item={step.time} icon={<Clock className="size-4" aria-hidden />} />}
                {step.fee && <Verification item={step.fee} icon={<IndianRupee className="size-4" aria-hidden />} />}
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="flex items-center gap-2 text-sm font-semibold"><UserRound className="size-4 text-saffron" aria-hidden />Form-fill summary</h4>
                  <CopyButton text={summary} />
                </div>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed">{summary}</pre>
                <p className="mt-1.5 text-xs text-muted-foreground">Built from “Your details” above. Paste into the official form yourself; Seva Saathi never submits anything.</p>
              </div>

              {step.caveat && (
                <p className="flex items-start gap-2 rounded-lg bg-saffron-soft p-3 text-sm">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-saffron" aria-hidden />{step.caveat}
                </p>
              )}

              <div>
                <h4 className="text-sm font-semibold">Official links for this step</h4>
                <ul className="mt-2 space-y-2">
                  {step.links.map((l) => (
                    <li key={l.url} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <a className="font-medium text-primary underline underline-offset-2" href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>
                      <LinkStatusNote url={l.url} compact />
                    </li>
                  ))}
                </ul>
                {step.stateSpecific && (
                  <p className="mt-2 text-sm">
                    State process: see your state&apos;s portal in the <Link className="font-medium text-primary underline underline-offset-2" href="/services?level=State">state directory</Link>.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function ProfileForm({ journey }: { journey: Journey }) {
  const { profile, setField, clear } = useProfile();
  return (
    <details className="group rounded-2xl border border-border bg-card" open>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 font-heading text-lg font-semibold sm:p-5">
        Your details (optional)
        <ChevronDown className="size-5 transition group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-border p-4 sm:p-5">
        <p className="mb-4 flex items-start gap-2 text-sm text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
          These stay in this browser only and are used to build the copy-ready form summaries below. Please do not enter Aadhaar, PAN, OTP or bank details here.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {journey.profileFields.map((k) => {
            const meta = PROFILE_LABELS[k];
            const id = `profile-${k}`;
            const long = k.toLowerCase().includes("address");
            return (
              <div key={k} className={long ? "sm:col-span-2" : undefined}>
                <label htmlFor={id} className="mb-1 block text-sm font-medium">{meta.label}</label>
                {long ? (
                  <textarea id={id} rows={2} value={profile[k] ?? ""} onChange={(e) => setField(k, e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                ) : (
                  <input id={id} type={meta.type ?? "text"} value={profile[k] ?? ""} onChange={(e) => setField(k, e.target.value)} autoComplete="off" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <Button type="button" variant="ghost" size="sm" onClick={clear}>Clear my details</Button>
        </div>
      </div>
    </details>
  );
}

export function JourneyPlanner({ journey }: { journey: Journey }) {
  const { reset } = useProgress(journey);
  const titleById = useMemo(() => Object.fromEntries(journey.steps.map((s) => [s.id, s.title])), [journey]);

  return (
    <div className="space-y-6">
      <ProgressSummary journey={journey} />
      <ProfileForm journey={journey} />
      <ol className="space-y-4" aria-label={`Steps for ${journey.title}`}>
        {journey.steps.map((s, i) => (
          <StepCard key={s.id} journey={journey} step={s} index={i} titleById={titleById} />
        ))}
      </ol>
      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={() => { if (window.confirm("Clear all ticks for this guide?")) reset(journey.slug); }}>
          <RotateCcw className="size-3.5" aria-hidden /> Reset checklist
        </Button>
      </div>
    </div>
  );
}

export function MiniChecklist({ journey }: { journey: Journey }) {
  const { done, toggle, start } = useProgress(journey);
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <ProgressSummary journey={journey} />
      <ol className="mt-4 space-y-2.5">
        {journey.steps.map((s, i) => {
          const id = `mini-${journey.slug}-${s.id}`;
          return (
            <li key={s.id} className="flex items-start gap-2.5 text-sm">
              <input id={id} type="checkbox" checked={Boolean(done[s.id])} onChange={() => { start(journey.slug); toggle(journey.slug, s.id); }} className="mt-0.5 size-4 cursor-pointer accent-[var(--india-green)]" />
              <label htmlFor={id} className={cn("cursor-pointer leading-snug", done[s.id] && "text-muted-foreground line-through")}>
                <span className="font-medium">{i + 1}. {s.title}</span>
                {s.optional && <span className="text-muted-foreground"> (optional)</span>}
                <span className="block text-xs text-muted-foreground">{s.agency}</span>
              </label>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
