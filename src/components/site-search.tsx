"use client";

import { Search } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function SiteSearch({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <form action="/services" method="get" role="search" className={className}>
      <label htmlFor="site-search" className="sr-only">{t.searchPlaceholder}</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          id="site-search"
          name="q"
          type="search"
          autoComplete="off"
          placeholder={t.searchPlaceholder}
          className="h-9 w-full min-w-[10rem] max-w-[14rem] rounded-md border border-input bg-background py-1 pl-8 pr-2 text-sm placeholder:text-muted-foreground lg:max-w-[16rem]"
        />
      </div>
    </form>
  );
}
