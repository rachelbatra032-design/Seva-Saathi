import { CircleCheck, CircleHelp, ShieldCheck } from "lucide-react";
import { getLinkCheck } from "@/lib/services";

export function LinkStatusNote({ url, compact = false }: { url: string; compact?: boolean }) {
  const check = getLinkCheck(url);
  const date = check.checkedAt ? new Date(check.checkedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
  const host = new URL(url).hostname.replace(/^www\./, "");

  if (check.status === "ok") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-india-green">
        <CircleCheck className="size-3.5" aria-hidden />
        {compact ? "Link checked" : `Link responded on ${date}`}
      </span>
    );
  }
  if (check.status === "blocked") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" title={`${host} answered our automated check but refuses bots (HTTP ${check.httpCode}).`}>
        <ShieldCheck className="size-3.5" aria-hidden />
        {compact ? "Official domain" : `Official domain; site blocks automated checks (${date})`}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" title="Our automated check could not reach this site from its network. It may be restricted outside India.">
      <CircleHelp className="size-3.5" aria-hidden />
      {compact ? "Not auto-checked" : "Not reachable from our checker; open the official site to confirm"}
    </span>
  );
}
