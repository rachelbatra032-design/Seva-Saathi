import type { Metadata } from "next";
import { OfficialLinkButton } from "@/components/official-link-button";
import { allServices, getLinkCheck } from "@/lib/services";

export const metadata: Metadata = {
  title: "About and data sources",
  description: "What Seva Saathi is, what it is not, how we pick and check official links, and how the assistant avoids guessing.",
};

export default function AboutPage() {
  const checks = allServices.map((s) => getLinkCheck(s.url));
  const count = (status: string) => checks.filter((c) => c.status === status).length;
  const latest = checks.map((c) => c.checkedAt).filter(Boolean).sort().at(-1);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-semibold text-primary">About</p>
      <h1 className="mt-2 text-4xl font-semibold text-primary">An unofficial guide that always points to the official source</h1>
      <div className="mt-6 space-y-5 leading-relaxed text-foreground/90">
        <p>Seva Saathi is an independent project. It is not run by, endorsed by or affiliated with the Government of India or any state government. It collects links and plain-language summaries so that you do not have to chase across dozens of websites, and it sends you to the official site for every action.</p>
        <p>The government&apos;s own directory of services is the National Portal of India. We recommend it as the authoritative starting point.</p>
        <div><OfficialLinkButton href="https://www.india.gov.in/" variant="outline">Visit india.gov.in</OfficialLinkButton></div>

        <h2 className="pt-4 text-2xl font-semibold text-primary">How we choose links</h2>
        <p>Only addresses on government domains (such as gov.in and nic.in), or on a short, named list of domains run by official agencies, are accepted. A check in our build refuses anything else. We do not use shortened links or third-party facilitators.</p>
        <h2 className="pt-4 text-2xl font-semibold text-primary">How we check them</h2>
        <p>A script requests each link and records the result. At the last run ({latest ? new Date(latest).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "not yet run"}), of {allServices.length} service links: <strong>{count("ok")}</strong> responded normally, <strong>{count("blocked")}</strong> were reachable but refuse automated requests, and <strong>{count("unreachable")}</strong> could not be reached from our checking network. Many Indian government sites restrict access from outside India or have incomplete certificate chains, so &quot;not reachable&quot; does not mean a link is broken. Each page shows its own status.</p>
        <h2 className="pt-4 text-2xl font-semibold text-primary">How the assistant avoids guessing</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>It searches only our curated corpus: the services directory, the life-event guides and page titles/descriptions fetched from official sites.</li>
          <li>Every answer lists its sources. A citation is dropped if it is not an official address.</li>
          <li>If nothing in the corpus supports an answer, it says so and points to the National Portal rather than inventing one.</li>
          <li>It cannot look up your personal records and will tell you not to share Aadhaar, PAN or OTPs.</li>
        </ul>
        <h2 className="pt-4 text-2xl font-semibold text-primary">Your data</h2>
        <p>Your checklist ticks and the optional details you type into the form-fill helper are stored only in your browser. Questions you ask are processed to produce an answer. If voice or translation is switched on, the audio or text is sent to Sarvam AI for that purpose.</p>
      </div>
    </div>
  );
}
