import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  title: string;
  description: string;
  meta?: string;
  icon?: ReactNode;
};

/** Editorial topic hub card (layout pattern re-implemented; not USWDS markup). */
export function TopicHubCard({ href, title, description, meta, icon }: Props) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/35 hover:shadow-md focus-visible:outline-none"
    >
      {icon && <span className="mb-3 grid size-10 place-items-center rounded-lg bg-secondary text-primary">{icon}</span>}
      <h3 className="font-heading text-lg font-semibold leading-snug text-primary group-hover:underline">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      {meta && <p className="mt-3 text-xs font-medium text-primary">{meta}</p>}
    </Link>
  );
}
