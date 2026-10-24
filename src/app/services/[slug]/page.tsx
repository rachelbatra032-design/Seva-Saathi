import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, FileText, Info, Languages, ListChecks, MapPin, Users } from "lucide-react";
import { allServices, categoryBySlug, getLinkCheck, getService, getSnippet, relatedServices, stateLabel } from "@/lib/services";
import { journeys } from "@/data/journeys";
import { Badge } from "@/components/ui/badge";
import { OfficialLinkButton } from "@/components/official-link-button";
import { LinkStatusNote } from "@/components/link-badge";
import { ServiceCard } from "@/components/service-card";

export function generateStaticParams() {
  return allServices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  return s ? { title: s.title, description: s.summary } : { title: "Service not found" };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const category = categoryBySlug[service.category];
  const related = relatedServices(service);
  const snippet = getSnippet(service.url);
  const host = new URL(service.url).hostname.replace(/^www\./, "");
  const usedIn = journeys.filter((j) => j.steps.some((st) => st.serviceSlugs?.includes(service.slug)));
  const check = getLinkCheck(service.url);

  const howTo = service.howToApply?.length
    ? service.howToApply
    : [
        `Open the official site (${host}) using the button above.`,
        "Look for the section for citizen services, schemes or the service you need.",
        "Follow the instructions on the site. If you are asked to pay, check that the address is the official one shown here.",
      ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link className="hover:underline" href="/services">Services</Link></li>
          <li aria-hidden>/</li>
          <li><Link className="hover:underline" href={`/topics/${service.category}`}>{category?.name}</Link></li>
        </ol>
      </nav>

      <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={service.level === "Central" ? "default" : "secondary"}>
              {service.level === "Central" ? "Central government" : `State: ${stateLabel(service.state)}`}
            </Badge>
            <Badge variant="outline">{category?.name}</Badge>
          </div>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-primary">{service.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground/85">{service.summary}</p>

          <section aria-labelledby="official" className="mt-8 rounded-2xl border-2 border-saffron/50 bg-saffron-soft p-5 sm:p-6">
            <h2 id="official" className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-foreground/70">
              Go to the official site
            </h2>
            <p className="mt-1 break-all font-mono text-sm text-foreground">{service.url}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <OfficialLinkButton href={service.url}>Open {host}</OfficialLinkButton>
              <LinkStatusNote url={service.url} />
            </div>
            <p className="mt-3 text-xs text-foreground/70">
              Seva Saathi is an unofficial aggregator. Applications, payments and status checks all happen on the official
              site. Never share OTPs or pay anyone who offers to &quot;fast-track&quot; a government service.
            </p>
          </section>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <section aria-labelledby="who">
              <h2 id="who" className="flex items-center gap-2 text-2xl font-semibold text-primary">
                <Users className="size-5 text-saffron" aria-hidden /> Who it&apos;s for
              </h2>
              <p className="mt-3 leading-relaxed text-foreground/85">
                {service.whoFor ?? `Citizens and residents who need to use the services of ${service.ministry}.`}
              </p>
            </section>
            <section aria-labelledby="docs">
              <h2 id="docs" className="flex items-center gap-2 text-2xl font-semibold text-primary">
                <FileText className="size-5 text-saffron" aria-hidden /> Documents commonly needed
              </h2>
              {service.documents && service.documents.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-foreground/85">
                  {service.documents.map((d) => (<li key={d}>{d}</li>))}
                </ul>
              ) : (
                <p className="mt-3 text-foreground/85">
                  No specific documents are listed. The official site tells you what you need for the service you choose.
                </p>
              )}
            </section>
          </div>

          <section aria-labelledby="how" className="mt-10">
            <h2 id="how" className="flex items-center gap-2 text-2xl font-semibold text-primary">
              <ListChecks className="size-5 text-saffron" aria-hidden /> How to apply
            </h2>
            <ol className="mt-4 space-y-3">
              {howTo.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-foreground/90">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              These steps are a general guide written by us. Forms, fees and eligibility change, so follow what the official site says.
            </p>
          </section>

          {snippet && (snippet.title || snippet.description) && (
            <section aria-labelledby="snapshot" className="mt-10 rounded-xl border border-border bg-muted/50 p-5">
              <h2 id="snapshot" className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                What the official page says about itself
              </h2>
              {snippet.title && <p className="mt-2 font-medium">{snippet.title}</p>}
              {snippet.description && <p className="mt-1 text-sm text-foreground/80">{snippet.description}</p>}
              <p className="mt-2 text-xs text-muted-foreground">
                Snapshot of the page title and description from {host}, fetched {new Date(snippet.fetchedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}. The assistant uses these snapshots as citations.
              </p>
            </section>
          )}

          {usedIn.length > 0 && (
            <section aria-labelledby="journeys" className="mt-10">
              <h2 id="journeys" className="text-2xl font-semibold text-primary">Part of these life-event guides</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {usedIn.map((j) => (
                  <li key={j.slug}>
                    <Link href={`/journeys/${j.slug}`} className="inline-flex rounded-full border border-input px-3 py-1.5 text-sm font-medium hover:bg-muted">
                      {j.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-6" aria-label="Service facts">
          <dl className="rounded-2xl border border-border bg-card p-5 text-sm">
            <div className="flex gap-3 border-b border-border pb-4">
              <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Owned by</dt>
                <dd className="mt-0.5 font-medium">{service.ministry}</dd>
              </div>
            </div>
            <div className="flex gap-3 border-b border-border py-4">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Level</dt>
                <dd className="mt-0.5 font-medium">
                  {service.level === "Central" ? "Central government" : `State government, ${stateLabel(service.state)}`}
                </dd>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Languages className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Languages</dt>
                <dd className="mt-0.5 font-medium">{service.languages.join(", ")}</dd>
              </div>
            </div>
          </dl>
          {check.status !== "ok" && (
            <p className="rounded-xl bg-muted p-4 text-xs leading-relaxed text-muted-foreground">
              Our automated link checker could not load this site from its network, which is common for Indian
              government sites that restrict outside access. The address is the one published by the department;
              open it to confirm.
            </p>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-16">
          <h2 id="related" className="text-2xl font-semibold text-primary">Related services</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (<li key={r.slug}><ServiceCard service={r} /></li>))}
          </ul>
        </section>
      )}
    </div>
  );
}
