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
import { AppUtils } from "@/components/app-utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
export const metadata: Metadata = {
  title: "Careers | AWFixer",
  description:
    "Work with AWFixer's Church and its allied organizations — church roles, movement arms, and personal staff opportunities.",
  metadataBase: new URL("https://careers.awfixer.llc"),
  icons: {
    icon: { url: "/church-splash.svg", type: "image/svg+xml" },
  },
  openGraph: {
    title: "Careers | AWFixer",
    description:
      "Join the mission directly or serve through an allied organization across the AWFixer ecosystem.",
    url: "https://careers.awfixer.llc",
    siteName: "AWFixer Careers",
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
      className={cn("dark antialiased", fontMono.variable, "font-sans", geist.variable)}
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
        <AppUtils />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
