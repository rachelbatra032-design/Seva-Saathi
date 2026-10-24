import { ShieldAlert } from "lucide-react";

export function UnofficialBanner() {
  return (
    <div
      role="note"
      className="border-b border-saffron/30 bg-saffron-soft text-[13px] text-foreground"
    >
      <div className="mx-auto flex max-w-6xl items-start gap-2 px-4 py-2 sm:items-center">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-saffron sm:mt-0" aria-hidden />
        <p>
          <strong className="font-semibold">Unofficial aggregator.</strong> Seva Saathi is not run by
          the Government of India. We collect links and summaries and always send you to the
          official site to act. The government&apos;s own directory is{" "}
          <a
            className="font-medium underline underline-offset-2 hover:text-primary"
            href="https://www.india.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            india.gov.in
          </a>
          .
        </p>
      </div>
    </div>
  );
}
