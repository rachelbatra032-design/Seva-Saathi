import { NextResponse } from "next/server";
import { grantMockConsent, digilockerAuthorizeUrl } from "@/lib/actions/stubs";
import type { ConsentRequest, ConsentScope } from "@/lib/actions/types";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const SCOPES = new Set<ConsentScope>(["digilocker-read-metadata", "apisetu-prefill", "delegated-submit"]);

export async function POST(req: Request) {
  if (!rateLimit(`consent:${clientKey(req)}`, 20)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: ConsentRequest;
  try {
    body = (await req.json()) as ConsentRequest;
  } catch {
    return NextResponse.json({ error: "JSON required" }, { status: 400 });
  }

  if (!body.scope || !SCOPES.has(body.scope)) {
    return NextResponse.json({ error: "Unknown consent scope" }, { status: 400 });
  }

  const grant = grantMockConsent(body);
  const roadmap = {
    stage: body.scope === "delegated-submit" ? 3 : 2,
    status: "roadmap_stub",
    message:
      "This is a labelled roadmap stub. Seva Saathi does not call DigiLocker or API Setu until you complete official onboarding.",
  };

  return NextResponse.json({
    grant,
    roadmap,
    digilockerAuthorizeUrl: body.scope === "digilocker-read-metadata" ? digilockerAuthorizeUrl(grant.id) : null,
  });
}
