const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous\s+)?(above\s+)?instructions/i,
  /you are now (a|an) /i,
  /system:\s*/i,
  /<\s*script/i,
];

export function sanitizeUserQuery(input: string): { ok: true; text: string } | { ok: false; reason: string } {
  const text = input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
  if (!text) return { ok: false, reason: "empty" };
  if (text.length > 600) return { ok: false, reason: "too_long" };
  for (const re of INJECTION_PATTERNS) {
    if (re.test(text)) return { ok: false, reason: "blocked_pattern" };
  }
  return { ok: true, text };
}

/** Treat fetched web text as data, not instructions. */
export function wrapCorpusText(text: string): string {
  return text.replace(/<\s*script[\s\S]*?<\/script>/gi, " ").slice(0, 4000);
}
