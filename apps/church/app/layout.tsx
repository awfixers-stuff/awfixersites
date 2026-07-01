import { ClinkProvider } from "@awfixersites/telemetry/link";
import clinkConfig from "../clink.json";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SplashProvider } from "@/components/splash-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AWFixer's Church",
  description:
    "A church built on a question, not a creed. On what principle was the world founded? — a scientific and spiritual inquiry into the axioms underneath every worldview.",
  icons: {
    icon: { url: "/church-splash.svg", type: "image/svg+xml" },
  },
  openGraph: {
    title: "AWFixer's Church",
    description:
      "A church built on a question, not a creed. On what principle was the world founded? — a scientific and spiritual inquiry into the axioms underneath every worldview.",
    url: "https://awfixer.church",
    siteName: "AWFixer's Church",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider>
          <SplashProvider>
            <SiteHeader />
            <main className="min-h-svh pt-20">
              <ClinkProvider config={clinkConfig}>{children}</ClinkProvider>
            </main>
            <SiteFooter />
          </SplashProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
