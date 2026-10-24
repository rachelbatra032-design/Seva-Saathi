import type { Metadata, Viewport } from "next";
import { Geist_Mono, Noto_Sans, Noto_Sans_Bengali, Noto_Sans_Devanagari, Noto_Sans_Tamil, Noto_Sans_Telugu, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UnofficialBanner } from "@/components/unofficial-banner";
import { LanguageProvider } from "@/components/language-provider";
import type { RootLayoutProps } from "@/types/app-router";

const notoSans = Noto_Sans({ variable: "--font-sans-latin", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const sourceSerif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin"] });
const devanagari = Noto_Sans_Devanagari({ variable: "--font-devanagari", subsets: ["devanagari"], display: "swap" });
const tamil = Noto_Sans_Tamil({ variable: "--font-tamil", subsets: ["tamil"], weight: ["400", "600", "700"], display: "swap" });
const telugu = Noto_Sans_Telugu({ variable: "--font-telugu", subsets: ["telugu"], weight: ["400", "600", "700"], display: "swap" });
const bengali = Noto_Sans_Bengali({ variable: "--font-bengali", subsets: ["bengali"], weight: ["400", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Seva Saathi — unofficial guide to Indian government services",
    template: "%s | Seva Saathi (unofficial)",
  },
  description:
    "An unofficial aggregator that gathers links to Indian government services, schemes and updates in one place, and guides you through life events using official sources only.",
  applicationName: "Seva Saathi",
};

export const viewport: Viewport = {
  themeColor: "#1b2a5c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${geistMono.variable} ${sourceSerif.variable} ${devanagari.variable} ${tamil.variable} ${telugu.variable} ${bengali.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LanguageProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to main content
          </a>
          <UnofficialBanner />
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
