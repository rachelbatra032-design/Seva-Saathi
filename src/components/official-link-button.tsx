import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfficialLinkButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        variant === "primary"
          ? "bg-saffron text-[oklch(0.2_0.03_265)] hover:brightness-95"
          : "border border-input bg-background hover:bg-muted",
        className,
      )}
    >
      {children}
      <ExternalLink className="size-4" aria-hidden />
      <span className="sr-only">(opens the official site in a new tab)</span>
    </a>
  );
}
