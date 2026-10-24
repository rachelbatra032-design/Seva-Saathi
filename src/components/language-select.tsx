"use client";

import { Languages } from "lucide-react";
import { LANGUAGES } from "@/lib/languages";
import { useLanguage } from "@/components/language-provider";

export function LanguageSelect({ className }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();
  return (
    <label className={`inline-flex items-center gap-1.5 text-sm ${className ?? ""}`}>
      <Languages className="size-4 text-muted-foreground" aria-hidden />
      <span className="sr-only">{t.language}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="h-8 max-w-[11rem] rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.native}
            {l.native !== l.name ? ` (${l.name})` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
