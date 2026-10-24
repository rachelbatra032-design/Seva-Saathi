/**
 * Hosts we treat as official sources for citations. Government TLDs are accepted wholesale;
 * a short list of non-.gov.in domains run by official agencies is added explicitly.
 */
const GOV_SUFFIXES = [".gov.in", ".nic.in", ".gov", ".mil.in", ".ac.in"];
const OFFICIAL_EXTRA = new Set([
  "www.mygov.in",
  "mygov.in",
  "www.rbi.org.in",
  "rbi.org.in",
  "www.irctc.co.in",
  "www.onlineservices.nsdl.com",
  "www.npscra.nsdl.co.in",
  "www.pan.utiitsl.com",
  "www.pfrda.org.in",
  "ihmcl.co.in",
  "nta.ac.in",
]);

export function isOfficialUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    return OFFICIAL_EXTRA.has(host) || GOV_SUFFIXES.some((s) => host.endsWith(s));
  } catch {
    return false;
  }
}

export function publisherFromUrl(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}
