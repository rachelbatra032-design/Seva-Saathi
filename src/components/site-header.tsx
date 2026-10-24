"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSelect } from "@/components/language-select";
import { SiteSearch } from "@/components/site-search";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span
        aria-hidden
        className="grid size-9 place-items-center rounded-lg bg-primary font-heading text-sm font-bold text-primary-foreground"
      >
        SS
      </span>
      <span className="leading-none">
        <span className="block font-heading text-xl font-semibold tracking-tight text-primary">Seva Saathi</span>
        <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Unofficial
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const nav = [
    { href: "/journeys", label: t.navJourneys },
    { href: "/services", label: t.navServices },
    { href: "/topics", label: t.navTopics },
    { href: "/updates", label: t.navUpdates },
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2 md:h-16 md:flex-nowrap md:py-0">
        <Logo />
        <nav aria-label="Primary" className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive(item.href) && "bg-muted text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <SiteSearch className="hidden xl:block" />
          <LanguageSelect className="hidden lg:inline-flex" />
          <Link
            href="/ask"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Sparkles className="size-4 text-saffron" aria-hidden />
            {t.navAsk}
          </Link>
          <Sheet>
            <SheetTrigger
              aria-label="Open menu"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-input md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Menu className="size-5" aria-hidden />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="px-4 pt-4 font-heading text-lg">Menu</SheetTitle>
              <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2.5 text-base font-medium hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link href="/ask" className="rounded-md px-3 py-2.5 text-base font-medium hover:bg-muted">
                  {t.navAsk} Seva Saathi
                </Link>
                <div className="mt-3 space-y-4 border-t pt-4">
                  <SiteSearch className="w-full" />
                  <LanguageSelect />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
