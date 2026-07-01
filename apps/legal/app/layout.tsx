import { ClinkProvider } from "@awfixersites/telemetry/link";
import clinkConfig from "../clink.json";
import { Geist, IBM_Plex_Mono, Syne } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SteelBackdrop } from "@/components/steel-backdrop";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AWFixer Legal",
  description: "Canonical privacy, terms, and legal disclosures for AWFixer properties.",
  metadataBase: new URL("https://legal.awfixer.llc"),
  openGraph: {
    title: "AWFixer Legal",
    description: "Policies and legal disclosures for the AWFixer ecosystem.",
    url: "https://legal.awfixer.llc",
    siteName: "AWFixer Legal",
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14161a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark antialiased",
        geist.variable,
        syne.variable,
        plexMono.variable,
        "font-sans",
      )}
      suppressHydrationWarning
    >
      <body className="relative min-h-svh">
        <SteelBackdrop />
        <ThemeProvider>
          <div className="relative z-10 flex min-h-svh flex-col">
            <SiteHeader />
            <main className="flex-1 pt-16"><ClinkProvider config={clinkConfig}>{children}</ClinkProvider></main>
            <SiteFooter />
          </div>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
