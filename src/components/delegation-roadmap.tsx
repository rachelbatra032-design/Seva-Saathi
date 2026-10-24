import { Lock, ShieldOff } from "lucide-react";
import { OfficialLinkButton } from "@/components/official-link-button";

export function DelegationRoadmap() {
  return (
    <section aria-labelledby="delegation" className="rounded-2xl border border-dashed border-primary/40 bg-secondary/60 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
          <Lock className="size-3" aria-hidden /> Roadmap, not available yet
        </span>
      </div>
      <h2 id="delegation" className="mt-3 text-2xl font-semibold text-primary">Let Seva Saathi do the filing for you</h2>
      <p className="mt-2 max-w-2xl text-foreground/85">
        Today Seva Saathi guides you, prepares your document checklist and form data, and sends you to the right official page.
        A later stage could act on your behalf, but only with your explicit, revocable consent, given through DigiLocker or an
        official API Setu flow, and only for the specific step you approve.
      </p>
      <ul className="mt-4 grid gap-2 text-sm text-foreground/85 sm:grid-cols-2">
        <li className="flex gap-2"><ShieldOff className="mt-0.5 size-4 shrink-0 text-india-green" aria-hidden />Nothing is ever submitted to a government system by Seva Saathi today.</li>
        <li className="flex gap-2"><ShieldOff className="mt-0.5 size-4 shrink-0 text-india-green" aria-hidden />We never ask for or store your Aadhaar, PAN, OTPs or passwords.</li>
        <li className="flex gap-2"><ShieldOff className="mt-0.5 size-4 shrink-0 text-india-green" aria-hidden />Any future delegation would show exactly what is shared, with whom, and let you revoke it.</li>
        <li className="flex gap-2"><ShieldOff className="mt-0.5 size-4 shrink-0 text-india-green" aria-hidden />It would depend on departments opening official APIs, so coverage would start small.</li>
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-semibold opacity-60">
          Authorise with DigiLocker (coming later)
        </button>
        <OfficialLinkButton href="https://apisetu.gov.in/" variant="outline">About API Setu</OfficialLinkButton>
      </div>
    </section>
  );
}
