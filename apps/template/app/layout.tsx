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
import { AppUtils } from "@/components/app-utils";
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
  title: "AWFixer LLC",
  description:
    "AWFixer LLC is the management, administration, and oversight division of AWFixer's Church and church-owned organizations and businesses.",
  metadataBase: new URL("https://awfixer.llc"),
  openGraph: {
    title: "AWFixer LLC",
    description:
      "Management, administration, and oversight for AWFixer's Church and the organizations it stewards.",
    url: "https://awfixer.llc",
    siteName: "AWFixer LLC",
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
            <main className="flex-1 pt-16">
              <ClinkProvider config={clinkConfig}>{children}</ClinkProvider>
            </main>
            <SiteFooter />
          </div>
        </ThemeProvider>
        <AppUtils />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
