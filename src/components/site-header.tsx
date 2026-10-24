"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSelect } from "@/components/language-select";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span aria-hidden className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
        <span className="flex flex-col gap-[3px]">
          <span className="block h-[3px] w-5 rounded-full bg-saffron" />
          <span className="block h-[3px] w-5 rounded-full bg-white" />
          <span className="block h-[3px] w-5 rounded-full bg-india-green" />
        </span>
      </span>
      <span className="leading-none">
        <span className="block font-heading text-xl font-semibold tracking-tight text-primary">
          India<span className="text-saffron">.</span>Gov
        </span>
        <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Unofficial citizen guide
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
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
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
                  {t.navAsk} India.Gov
                </Link>
                <div className="mt-3 border-t pt-4">
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
