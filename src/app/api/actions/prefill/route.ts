import { NextResponse } from "next/server";
import { prefillForJourney } from "@/lib/actions/stubs";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  if (!rateLimit(`prefill:${clientKey(req)}`, 30)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { journeySlug?: unknown; profile?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON required" }, { status: 400 });
  }

  const slug = typeof body.journeySlug === "string" ? body.journeySlug : "";
  const profile =
    body.profile && typeof body.profile === "object" && !Array.isArray(body.profile)
      ? (body.profile as Record<string, string>)
      : {};

  const result = prefillForJourney(slug, profile);
  if (!result) return NextResponse.json({ error: "Unknown journey" }, { status: 404 });

  return NextResponse.json({
    ...result,
    stage: 1,
    status: "guide_and_deep_links_only",
  });
}
